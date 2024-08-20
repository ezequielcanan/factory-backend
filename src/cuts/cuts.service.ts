import { Injectable } from '@nestjs/common';
import { Cuts, CutsDocument } from './schema/cuts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CutsService {
  constructor(
    @InjectModel(Cuts.name) private cutsModel: Model<CutsDocument>
  ) {}
}
