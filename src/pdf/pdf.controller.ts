import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService
  ) { }

  @Get('/1/:oid')
  async generateWhitePdf(@Param("oid") oid: string, @Res() res: Response) {
    const doc = await this.pdfService.generateWhitePdf(oid, res)
    doc.end()
  }

  @Get('/2/:oid')
  async generatePdf(@Param("oid") oid: string, @Res() res: Response) {
    const doc = await this.pdfService.generateOrderPdf(oid, res)
    doc.end()
  }

  @Get('/budget/:oid')
  async generateBudgetFromOrder(@Param("oid") oid: string, @Query("info") info: string, @Query("dateOne") dateOne: string, @Query("dateTwo") dateTwo: string, @Query("transfer") transfer: string, @Res() res: Response) {
    const doc = await this.pdfService.generateBudget(oid, res, transfer ? parseInt(transfer) : 50, dateOne, dateTwo, info)
    doc.end()
  }

  @Get('/cc/:cid')
  async generateClientExcel(@Param("cid") cid: string, @Res() res: Response) {
    const [wb, name] = await this.pdfService.generateClientExcel(cid, res)
    wb.write(`Cuenta corriente ${name || ""}.xlsx`, res)
  }

  @Get("/articles")
  async generateArticlesExcel(@Query("society") society: string, @Res() res: Response) {
    const wb = await this.pdfService.generateArticlesExcel(society, res)
    wb.write(`STOCK ${society?.toUpperCase() || "GENERAL"}.xlsx`, res)
  }
}
