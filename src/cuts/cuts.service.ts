import { Injectable } from '@nestjs/common';
import { Cut, CutDocument } from './schema/cuts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCutDto } from './dto/create-cut.dto';
import { Order } from 'src/orders/schemas/orders.schema';

@Injectable()
export class CutsService {
  constructor(
    @InjectModel(Cut.name) private cutsModel: Model<CutDocument>
  ) {}

  async createCut(cut: CreateCutDto): Promise<Cut | undefined> {
    const {order, ...rest} = cut
    return this.cutsModel.create({order: new Types.ObjectId(order), ...rest})
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

  async getCutFromOrder(orderId: string | Types.ObjectId): Promise<Cut | undefined> {
    return this.cutsModel.findOne({order: orderId})
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
          order: '$orderDetails'
        }
      },
      {
        $project: {
          orderDetails: 0,
          filteredArticles: 0
        }
      }
    ])

    return cutsWithArticlesToCut
  }

  async getCut(id: string): Promise<Cut | undefined> {
    let cut = await this.cutsModel.findOne({ _id: id });

    if (cut) {
        cut = await cut.populate({
            path: 'order',
            populate: [
                {
                    path: 'articles.article',
                },
                {
                    path: 'articles.customArticle',
                },
            ],
        });
    }

    return cut;
  }
}
