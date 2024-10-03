import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClientsService } from 'src/clients/clients.service';
import { OrdersService } from 'src/orders/orders.service';
import * as xl from 'excel4node'
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment'
import 'moment/locale/es'

const fontHeadStyle = {
  font: {
    size: 18,
    bold: true,
    color: "#FFFFFF"
  }
}

const textCenterStyle = {
  alignment: {
    horizontal: 'center',
    vertical: 'center',
    wrapText: true
  },

}

const boldBorder = {
  border: {
    left: {
      style: 'medium',
      color: 'black',
    },
    right: {
      style: 'medium',
      color: 'black',
    },
    top: {
      style: 'medium',
      color: 'black',
    },
    bottom: {
      style: 'medium',
      color: 'black',
    },
    outline: false,
  }
}

const thinBorder = {
  border: {
    left: {
      style: 'thin',
      color: 'black',
    },
    right: {
      style: 'thin',
      color: 'black',
    },
    top: {
      style: 'thin',
      color: 'black',
    },
    bottom: {
      style: 'thin',
      color: 'black',
    },
    outline: false,
  }
}

const bgHead = {
  fill: {
    type: "pattern",
    patternType: "solid",
    bgColor: "#516480",
    fgColor: "#516480"
  }
}

const bgSectionHead = {
  fill: {
    type: "pattern",
    patternType: "solid",
    bgColor: "#8497B0",
    fgColor: "#8497B0"
  }
}

const bgSectionInfo = {
  fill: {
    type: "pattern",
    patternType: "solid",
    bgColor: "#b7daf6",
    fgColor: "#b7daf6"
  }
}

moment.locale('es');

// Obtén la fecha y hora actual formateadas
const fechaActual = moment().format('D [de] MMMM [del] YYYY HH:mm');

const percentageOfPageX = (percentage) => percentage * 595.28 / 100
const percentageOfPageY = (percentage) => percentage * 841.89 / 100
const assetsPath = "./src/assets"

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly ordersService: OrdersService
  ) {}

  @Get('/1/:oid')
  async generateWhitePdf(@Param("oid") oid: string, @Res() res: Response) {
    
    // ENCABEZADO -------------------------------------------------------

    const order = await this.ordersService.getOrder(oid)
    const doc = new PDFDocument({size: "A4"});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Presupuesto N°${order?.orderNumber}.pdf`);

    const mainColor = order?.society == "Arcan" ? "#5357a1" : "#6b204e"

    doc.pipe(res)
    doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(6).text(order?.client["name"], percentageOfPageX(16.5), percentageOfPageY(9.59))
    doc.text(order?.client["address"], percentageOfPageX(16.5), percentageOfPageY(11))
    doc.text(order?.client["expreso"], percentageOfPageX(16.5), percentageOfPageY(13.95))
    doc.text(order?.client["expresoAddress"], percentageOfPageX(16.5), percentageOfPageY(15.55))

    doc.text(moment().format("DD"), percentageOfPageX(49), percentageOfPageY(4.85))
    doc.text(moment().format("MM"), percentageOfPageX(54), percentageOfPageY(4.85))
    doc.text(moment().format("YYYY"), percentageOfPageX(62), percentageOfPageY(4.85))


    const padding = 1.2
    order?.articles?.forEach((article, i) => {
      doc.text(article?.quantity, percentageOfPageX(11), percentageOfPageY(20 + padding * i))
      doc.text(article?.article ? article?.article["description"] : article?.customArticle["detail"], percentageOfPageX(28.5), percentageOfPageY(20 + padding * i))
    })

    doc.end();
  }

  @Get('/2/:oid')
  async generatePdf(@Param("oid") oid: string, @Res() res: Response) {
    
    // ENCABEZADO -------------------------------------------------------

    const order = await this.ordersService.getOrder(oid)
    const doc = new PDFDocument({size: "A4"});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Presupuesto N°${order?.orderNumber}.pdf`);

    const mainColor = order?.society == "Arcan" ? "#5357a1" : "#6b204e"

    doc.pipe(res);

    doc.save().moveTo(0, 0).lineTo(0, percentageOfPageY(60)).lineTo(percentageOfPageX(40), 0).fill(mainColor)

    doc.image(`${assetsPath}/${order?.society?.toLowerCase()}.png`, 20, 0, {
      fit: [150, 150],
      align: 'center',
      valign: 'center'
    })

    const items = [
      {header: "Cliente", value: order?.client["name"]},
      {header: "Domicilio", value: order?.client["address"]},
      {header: "Presupuesto", value: "N° " + order?.orderNumber},
    ]

    const itemsInitialXPercentage = 40
    const paddingItems = 3
    items.forEach((item,i) => {
      doc.fill(mainColor).font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(12).text(item.header, percentageOfPageX(itemsInitialXPercentage+(!i ? paddingItems : 20 * i)), percentageOfPageY(5), {width: percentageOfPageX(20 - paddingItems * 2), ellipsis: false})
      doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(10).text(item.value, percentageOfPageX(itemsInitialXPercentage+(!i ? paddingItems : 20 * i)), percentageOfPageY(7.5), {width: percentageOfPageX(20 - paddingItems * 2), ellipsis: true})
    })


    // TABLA DE ARTICULOS ----------------------------------------------
    
    const firstYTable = 20
    const firstXTable = 5
    const yTable = percentageOfPageY(firstYTable)
    const xTable = percentageOfPageX(firstXTable)

    doc.save().moveTo(xTable, yTable).lineTo(percentageOfPageX(100-firstXTable), yTable).lineTo(percentageOfPageX(100-firstXTable), yTable + percentageOfPageY(5)).lineTo(xTable, yTable + percentageOfPageY(5)).fill(order?.society == "Arcan" ? '#22255c' : "#42062b")
    
    const headers = ["Cantidad", "Producto", "Detalle", "Unitario", "Total"]

    headers.forEach((header, i) => {
      doc.fill("#FFFFFF").font(`${assetsPath}/fonts/Montserrat-Bold.ttf`).fontSize(12).text(header, percentageOfPageX(firstXTable+(!i ? 3 : 18 * i)), yTable + percentageOfPageY(1.5))
    })

    const padding = 3
    let finalY = yTable + percentageOfPageY(5)
    order?.articles?.forEach((article, i) => {
      const yRow = percentageOfPageY(firstYTable+(!i ? 5 : 5 + 7 * i))

      doc.save().moveTo(xTable, yRow).lineTo(percentageOfPageX(100-firstXTable), yRow).lineTo(percentageOfPageX(100-firstXTable), percentageOfPageY(firstYTable+(!i ? 5 : 5 + 7 * i)+7)).lineTo(xTable, percentageOfPageY(firstYTable+(!i ? 5 : 5 + 7 * i)+7)).fill(i % 2 ? "#CCCCCC" : "#EEEEEE")
      
      const texts = [
        {value: article?.quantity},
        {notText: true, value: `./uploads/articles/${article?.customArticle ? "custom/" : ""}${article?.article?._id || article?.customArticle?._id}/thumbnail.png`},
        {value: article?.article ? article?.article["description"] : article?.customArticle["detail"]},
        {value: article?.price || 0},
        {value: (article?.price || 0) * (article?.quantity || 0)}
      ]

      texts.forEach((text, iText) => {
        if (text?.notText) {
          doc.image(text?.value, percentageOfPageX(firstXTable+(!iText ? 3 : 18 * iText)), yRow + percentageOfPageY(0.25), {
            fit: [percentageOfPageX(12), percentageOfPageY(6.5)],
            align: 'center',
            valign: 'center'
          });
        } else {
          doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(10).text(text?.value, percentageOfPageX(firstXTable+(!iText ? 3 : 18 * iText)), yRow + percentageOfPageY(padding))
        }
      })
      finalY = percentageOfPageY(firstYTable+(!i ? 5 : 5 + 7 * i)+7)
    })

    const totalString = `Total: $${order?.articles?.reduce((acc,art) => acc+((art?.price || 0) * (art?.quantity || 0)),0)}`

    const textWidth = doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-ExtraBold.ttf`).fontSize(18).widthOfString(totalString);

    const xStartPosition = percentageOfPageX(95) - textWidth;

    doc.text(totalString, xStartPosition, finalY + percentageOfPageY(3), { width: 0, ellipsis: false })
    
    // PIE ------------------------------------------------------------

    const pageWidth = doc.page.width
    const textsFooter = ["Administracion y ventas", "arcan.ventas@gmail.com", "7709-1657"]
    const distanceBetweenTotal = 12
    const distanceBetweenTexts = 2

    textsFooter.forEach((text,i) => {
      const textWidth = doc.font(`${assetsPath}/fonts/Montserrat-${!i ? "SemiBold" : "Regular"}.ttf`).fontSize(14).widthOfString(text)
      const textXPosition = (pageWidth - textWidth) / 2
  
      doc.text(text, textXPosition,finalY + percentageOfPageY(distanceBetweenTotal + distanceBetweenTexts * i))
    })

    doc.font(`${assetsPath}/fonts/Montserrat-Regular.ttf`).fontSize(8).text("Documento no válido como factura", percentageOfPageX(5), percentageOfPageY(88.5))
    doc.text("Realizado el " + moment().format('D [de] MMMM [del] YYYY HH:mm'), percentageOfPageX(5), percentageOfPageY(90))

    doc.end();
  }


  @Get('/cc/:cid')
  async generateClientExcel(@Param("cid") cid: string, @Res() res: Response) {
    const orders = await this.ordersService.getOrdersByClient(cid)
    const client = await this.clientsService.getClient(cid)

    const wb = new xl.Workbook()
    const ws = wb.addWorksheet("CUENTA CORRIENTE", {
      sheetFormat: {
        'defaultColWidth': 35,
        'defaultRowHeight': 30,
      }
    })
    
    const styles = {
      sectionHead: wb.createStyle({
        ...fontHeadStyle,
        ...textCenterStyle,
        ...boldBorder,
        ...bgHead,
        numberFormat: '#,##0.00; -#,##0.00; -'
      }),
      importantCell: wb.createStyle({
        font: {
          bold: true
        },
        ...textCenterStyle,
        ...thinBorder,
        ...bgSectionInfo,
        numberFormat: '#,##0.00; -#,##0.00; -'
      }),
      cell: wb.createStyle({
        ...textCenterStyle,
        ...thinBorder,
        numberFormat: '#,##0.00; -#,##0.00; -'
      })
    }

    ws.cell(1, 1, 1, 4, true).string(`Cuenta corriente ${client?.name}`).style(styles["sectionHead"])
    const dateCol = 1
    const motivoCol = 2
    const amountCol = 3
    const totalCol = 4

    ws.cell(2, dateCol).string(`FECHA`).style(styles["importantCell"])
    ws.cell(2, motivoCol).string(`MOTIVO`).style(styles["importantCell"])
    ws.cell(2, amountCol).string(`MONTO`).style(styles["importantCell"])
    ws.cell(2, totalCol).string(`TOTAL`).style(styles["importantCell"])

    console.log(orders)
    orders.forEach((order, i) => {
      console.log(order?.finalDate)
      const row = 3+(i*2)
      ws.cell(row,dateCol).string(moment(order?.finalDate).format("DD-MM-YYYY")).style(styles["cell"])
      ws.cell(row,motivoCol).string(`Pedido N° ${order?.orderNumber}`).style(styles["cell"])
      ws.cell(row,amountCol).number(order?.articles?.reduce((acc,art) => acc+((art?.quantity || 0) * (art?.price || 0)), 0)).style(styles["cell"])
      ws.cell(row,totalCol).formula(`+${i ? xl.getExcelCellRef(row-1,totalCol) : "0"} + ${xl.getExcelCellRef(row,amountCol)}`).style(styles["cell"])

      const paymentRow = row+1
      ws.cell(paymentRow,dateCol).string(moment(order?.finalDate).format("DD-MM-YYYY")).style(styles["cell"])
      ws.cell(paymentRow,motivoCol).string(`Pago pedido N° ${order?.orderNumber}`).style(styles["cell"])
      ws.cell(paymentRow,amountCol).number(order?.paid || 0).style(styles["cell"])
      ws.cell(paymentRow,totalCol).formula(`+${xl.getExcelCellRef(paymentRow-1,totalCol)} - ${xl.getExcelCellRef(paymentRow,amountCol)}`).style(styles["cell"])
    })

    wb.write(`Cuenta corriente ${client?.name || ""}.xlsx`, res)
  }
}
