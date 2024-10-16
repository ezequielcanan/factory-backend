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
import { WorkshopOrder, WorkshopOrderDocument } from 'src/workshop-order/schema/workshop-order.schema';

@Injectable()
export class CutsService {
  constructor(
    @InjectModel(Cut.name) private cutsModel: Model<CutDocument>,
    @InjectModel(Article.name) private articlesModel: Model<ArticleDocument>,
    @InjectModel(CustomArticle.name) private customArticlesModel: Model<CustomArticleDocument>,
    @InjectModel(WorkshopOrder.name) private workshopOrderModel: Model<WorkshopOrderDocument>,

  ) { }

  async createCut(cut: CreateCutDto): Promise<Cut | undefined> {
    const { order, ...rest } = cut
    return this.cutsModel.create({ order: new Types.ObjectId(order), ...rest })
  }

  async createManualCut(cut: CreateCutDto): Promise<Cut | undefined> {
    cut.manualItems = cut?.manualItems?.map(i => {return {...i, article: new Types.ObjectId(i?.article)}})
    return this.cutsModel.create(cut)
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

  async getCutWithPopulatedArticles(cut, workshop = false): Promise<any> {
    let classicArticles = cut?.order?.articles || (cut?.items?.length && cut.items) || cut?.manualItems
    let workshopArticles = [...cut?.workshopOrders?.map(o => o?.articles)].flat()
    let articles = workshop ? workshopArticles : classicArticles

    if (articles) {
      const populatedArticles = await Promise.all(articles?.map(async article => {
        const returnObj = { ...article }
        if (cut?.manualItems?.length) {
        }
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
      if (workshop) {
        cut.workshopArticles = populatedArticles
      } else if (cut?.order?.articles) {
        cut.order.articles = populatedArticles
      } else if (cut?.items?.length) {
        cut.items = populatedArticles
      } else {
        cut.manualItems = populatedArticles
      }
    }

    return cut
  }

  async getCutsWithPopulatedArticles(cuts, workshop = false): Promise<any> {
    return Promise.all(cuts?.map(async cut => {
      return await this.getCutWithPopulatedArticles(cut, workshop)
    }))
  }

  async getCutsAgreggation(forFinished = false): Promise<any> {
    const matchCond = !forFinished ? {
      $and: [
        { $eq: ['$$article.hasToBeCut', true] },
        { $gt: ['$$article.quantity', '$$article.booked'] }
      ]
    } : {}
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
        $unwind: {
          path: '$orderDetails',
          preserveNullAndEmptyArrays: true
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
        $addFields: {
          filteredArticles: {
            $filter: {
              input: '$orderDetails.articles',
              as: 'article',
              cond: matchCond
            }
          }
        }
      },
      {
        $match: {
          $or: [
            { 'filteredArticles.0': { $exists: true } },
            { orderDetails: null }
          ]
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
        $project: {
          orderDetails: 0,
          filteredArticles: 0
        }
      }
    ])

    const finalCuts = await this.getCutsWithPopulatedArticles(cutsWithArticlesToCut, forFinished)

    return finalCuts
  }

  async getCuts(): Promise<Cut[] | undefined> {
    const finalCuts = await this.getCutsAgreggation()
    return finalCuts.filter(c => {
      const articlesInWorkshops = c?.workshopOrders?.map(order => {
        return order?.articles?.map(art => String(art?.article ? art?.article?._id : art?.customArticle?._id))
      }).flat()
      const cutArticles = (c?.order ? c?.order?.articles : c?.manualItems)?.map(art => String(art?.article ? art?.article?._id : art?.customArticle?._id))
      
      let notInWorkshopAnArticle = false
      cutArticles.forEach(a => {
        if (!articlesInWorkshops.includes(a)) {
          notInWorkshopAnArticle = true
        }
      })

      if (!notInWorkshopAnArticle && c?.workshopOrders?.every(o => o?.articles?.every(art => Number(art?.quantity || 0) - Number(art?.booked || 0) == (art?.received || 0)))) {
        return false
      } else {
        return true
      }
    })
  }

  async getFinishedCuts(): Promise<Cut[] | undefined> {
    const finalCuts = await this.getCutsAgreggation(true)
    return finalCuts.filter(c => {
      const articlesInWorkshops = c?.workshopOrders?.map(order => {
        return order?.articles?.map(art => String(art?.article ? art?.article?._id : art?.customArticle?._id))
      }).flat()
      const cutArticles = (c?.order ? c?.order?.articles : c?.manualItems)?.map(art => String(art?.article ? art?.article?._id : art?.customArticle?._id))
      const allBooked = c?.order ? c?.order?.articles?.every(art => art?.quantity == art?.booked) : false
      let notInWorkshopAnArticle = false
      cutArticles.forEach(a => {
        if (!articlesInWorkshops.includes(a)) {
          notInWorkshopAnArticle = true
        }
      })

      if ((!notInWorkshopAnArticle || (allBooked && c?.workshopArticles?.length)) && c?.workshopOrders?.every(o => o?.articles?.every(art => Number(art?.quantity || 0) - Number(art?.booked || 0) == (art?.received || 0)))) {
        return true
      } else {
        return false
      }
    })
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
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          workshopOrder: {
            $arrayElemAt: ['$workshopOrders', 0]
          }
        }
      }
    ]))[0]

    return await this.getCutWithPopulatedArticles(cut, false)
  }

  async deleteCutByOrder(id: string): Promise<Cut | undefined> {
    return this.cutsModel.findOneAndDelete({order: new Types.ObjectId(id)})
  }

  async updateCut(id: string, property: string, value: string): Promise<Cut | undefined> {
    const updateObj = {}
    updateObj[property] = value == "true" ? true : value
    return this.cutsModel.findOneAndUpdate({_id: new Types.ObjectId(id)}, {$set: updateObj}, {new: true})
  }

  async deleteCut(id: string): Promise<any> {
    const cut = await this.cutsModel.findOneAndDelete({_id: new Types.ObjectId(id)})
    if (cut) await this.workshopOrderModel.deleteOne({cut: cut["_id"]})
    return cut
  }
}
