import { Injectable } from '@nestjs/common';
import { Cut, CutDocument } from './schema/cuts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCutDto } from './dto/create-cut.dto';
import { Order } from 'src/orders/schemas/orders.schema';
import { Article, ArticleDocument } from 'src/articles/schema/articles.schema';
import { ArticlesService } from 'src/articles/articles.service';
import { CustomArticle, CustomArticleDocument } from 'src/articles/schema/customArticle.schema';
import { Item } from 'src/orders/schemas/item.schema';
import { Type } from 'class-transformer';

@Injectable()
export class CutsService {
  constructor(
    @InjectModel(Cut.name) private cutsModel: Model<CutDocument>,
    @InjectModel(Article.name) private articlesModel: Model<ArticleDocument>,
    @InjectModel(CustomArticle.name) private customArticlesModel: Model<CustomArticleDocument>,

  ) { }

  async createCut(cut: CreateCutDto): Promise<Cut | undefined> {
    const { order, ...rest } = cut
    return this.cutsModel.create({ order: new Types.ObjectId(order), ...rest })
  }

  async createCutFromOrder(order: any): Promise<Cut | undefined> {
    if (order?.articles?.some(a => a.hasToBeCut)) {
      const cut = {
        order: order?._id
      }
      return this.cutsModel.create(cut)
    } else {
      null
    }
  }

  async insertItems(id: string | Types.ObjectId, items: Item[]): Promise<Cut | undefined> {
    return this.cutsModel.findOneAndUpdate({_id: new Types.ObjectId(id)}, {$set: {items}}, {new: true})
  }

  async getCutFromOrder(orderId: string | Types.ObjectId): Promise<Cut | undefined> {
    return this.cutsModel.findOne({ order: orderId })
  } 

  async getCutWithPopulatedArticles(cut, inOrder = true): Promise<any> {
    let articles = (inOrder ? cut?.order?.articles : cut?.items)
    if (articles) {
      const populatedArticles = await Promise.all(articles?.map(async article => {
        const returnObj = { ...article }
        const commonArticle = await this.articlesModel.findOne({ _id: article?.article })
        const customArticle = await this.customArticlesModel.findOne({ _id: article?.customArticle })

        if (commonArticle) {
          returnObj["article"] = commonArticle
        }

        if (customArticle) {
          returnObj["customArticle"] = customArticle
        }

        return returnObj
      }))

      if (inOrder) {cut.order.articles = populatedArticles} else {cut.items = populatedArticles}
    }

    return cut
  }

  async getCutsWithPopulatedArticles(cuts, inOrder = true): Promise<any> {
    return Promise.all(cuts?.map(async cut => {
      return await this.getCutWithPopulatedArticles(cut, inOrder)
    }))
  }

  async getCuts(): Promise<Cut[] | undefined> {
    const cutsWithArticlesToCut = await this.cutsModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      {
        $unwind: '$orderDetails'
      },
      {
        $lookup: {
          from: 'workshoporders',
          localField: '_id',
          foreignField: 'cut',
          as: 'workshopOrders'
        }
      },
      {
        $addFields: {
          filteredArticles: {
            $filter: {
              input: '$orderDetails.articles',
              as: 'article',
              cond: {
                $and: [
                  { $eq: ['$$article.hasToBeCut', true] },
                  { $gt: ['$$article.quantity', '$$article.booked'] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          'filteredArticles.0': { $exists: true }
        }
      },
      {
        $addFields: {
          order: '$orderDetails',
          // Extrae el primer workshopOrder o null
          workshopOrder: {
            $arrayElemAt: ['$workshopOrders', 0]
          }
        }
      },
      {
        $addFields: {
          workshopOrder: {
            $cond: {
              if: { $ne: ['$workshopOrder', null] },
              then: '$workshopOrder',
              else: '$$REMOVE'
            }
          }
        }
      },
      {
        $project: {
          orderDetails: 0,
          workshopOrders: 0,
          filteredArticles: 0
        }
      }
    ])

    const finalCuts = await this.getCutsWithPopulatedArticles(cutsWithArticlesToCut)

    return finalCuts
  }

  async getFinishedCuts(): Promise<Cut[] | undefined> {
    const cuts = await this.cutsModel.find({'items.0': {$exists: true}})
    return await this.getCutsWithPopulatedArticles(cuts, false)
  }

  async getCut(id: string): Promise<Cut | undefined> {
    let cut = (await this.cutsModel.aggregate([
      {
        $match: {
          "_id": new Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'workshoporders',
          localField: '_id',
          foreignField: 'cut',
          as: 'workshopOrders'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'order'
        }
      },
      {
        $unwind: '$order'
      },
      {
        $addFields: {
          workshopOrder: {
            $arrayElemAt: ['$workshopOrders', 0]
          }
        }
      },
      {
        $addFields: {
          workshopOrder: {
            $cond: {
              if: { $ne: ['$workshopOrder', null] },
              then: '$workshopOrder',
              else: '$$REMOVE'
            }
          }
        }
      },
      {
        $project: {
          workshopOrders: 0
        }
      }
    ]))[0]

    return await this.getCutWithPopulatedArticles(cut, !cut?.items?.length)
  }
}
