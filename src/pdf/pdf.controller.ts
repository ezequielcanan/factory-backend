import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClientsService } from 'src/clients/clients.service';
import { OrdersService } from 'src/orders/orders.service';
import * as xl from 'excel4node'
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment'
import 'moment/locale/es'
import { PaymentsService } from 'src/payments/payments.service';
import { ArticlesService } from 'src/articles/articles.service';

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
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly articlesService: ArticlesService
  ) { }

  @Get('/1/:oid')
  async generateWhitePdf(@Param("oid") oid: string, @Res() res: Response) {

    // ENCABEZADO -------------------------------------------------------

    const order = await this.ordersService.getOrder(oid)
    const doc = new PDFDocument({ size: "A4" });

    if (order?.suborders?.length) {
      order.articles = order?.suborders?.map(suborder => suborder?.["articles"]).flat()
      order.articles = await this.ordersService.populateArticlesFromOrder(order)
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Presupuesto N°${order?.orderNumber}.pdf`);

    const mainColor = order?.society == "Arcan" ? "#5357a1" : "#6b204e"

    doc.pipe(res)
    doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(6).text(order?.client["name"], percentageOfPageX(18.5), percentageOfPageY(12.89))
    doc.text(order?.client["address"], percentageOfPageX(18.5), percentageOfPageY(14.8))
    doc.text(order?.client["expreso"], percentageOfPageX(18.5), percentageOfPageY(17.75))
    doc.text(order?.client["expresoAddress"], percentageOfPageX(18.5), percentageOfPageY(19.35))

    doc.text(moment().format("DD"), percentageOfPageX(72), percentageOfPageY(5.9))
    doc.text(moment().format("MM"), percentageOfPageX(82), percentageOfPageY(5.9))
    doc.text(moment().format("YYYY"), percentageOfPageX(92), percentageOfPageY(5.9))


    const padding = 1.2
    order?.articles?.forEach((article, i) => {
      doc.text(article?.quantity, percentageOfPageX(11), percentageOfPageY(29.5 + padding * i))
      doc.text(article?.article ? article?.article["description"] : article?.customArticle["detail"], percentageOfPageX(28.5), percentageOfPageY(29.5 + padding * i))
    })

    doc.end();
  }

  @Get('/2/:oid')
  async generatePdf(@Param("oid") oid: string, @Res() res: Response) {
    const order = await this.ordersService.getOrder(oid);
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const isArcan = order?.society == "Arcan"

    if (order?.suborders?.length) {
      order.articles = order?.suborders?.map(suborder => suborder?.["articles"]).flat()
      order.articles = await this.ordersService.populateArticlesFromOrder(order)
    }


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Presupuesto N°${order?.orderNumber}.pdf`);

    const mainColor = isArcan ? "#5357a1" : "#6b204e";
    doc.pipe(res);

    // ENCABEZADO
    doc.save().moveTo(0, 0).lineTo(0, percentageOfPageY(60)).lineTo(percentageOfPageX(40), 0).fill(mainColor);
    doc.image(`${assetsPath}/${order?.society?.toLowerCase()}.png`, 20, 0, { fit: [150, 150], align: 'center', valign: 'center' });

    const items = [
      { header: "Cliente", value: order?.client["name"] },
      { header: "Domicilio", value: order?.client["address"] },
      { header: "Presupuesto", value: "N° " + order?.orderNumber },
    ];

    const itemsInitialXPercentage = 40;
    const paddingItems = 3;
    items.forEach((item, i) => {
      doc.fill(mainColor).font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(12).text(item.header, percentageOfPageX(itemsInitialXPercentage + (!i ? paddingItems : 20 * i)), percentageOfPageY(5), { width: percentageOfPageX(20 - paddingItems * 2), ellipsis: false });
      doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(10).text(item.value, percentageOfPageX(itemsInitialXPercentage + (!i ? paddingItems : 20 * i)), percentageOfPageY(7.5), { width: percentageOfPageX(20 - paddingItems * 2), ellipsis: true });
    });

    // TABLA DE ARTICULOS
    const firstYTable = 20;
    const firstXTable = 5;
    const yTable = percentageOfPageY(firstYTable);
    const xTable = percentageOfPageX(firstXTable);

    // Dibujamos los headers solo una vez
    doc.save().moveTo(xTable, yTable).lineTo(percentageOfPageX(100 - firstXTable), yTable).lineTo(percentageOfPageX(100 - firstXTable), yTable + percentageOfPageY(5)).lineTo(xTable, yTable + percentageOfPageY(5)).fill(order?.society == "Arcan" ? '#22255c' : "#42062b");

    const headers = ["Cantidad", "Producto", "Detalle", "Unitario", "Total"];
    headers.forEach((header, i) => {
      doc.fill("#FFFFFF").font(`${assetsPath}/fonts/Montserrat-Bold.ttf`).fontSize(12).text(header, percentageOfPageX(firstXTable + (!i ? 3 : 18 * i)), yTable + percentageOfPageY(1.5));
    });

    let finalY = yTable + percentageOfPageY(5);
    const padding = 3;

    // Verifica si hay espacio suficiente para una nueva fila
    const checkAndAddPage = () => {
      if (finalY + percentageOfPageY(7) > doc.page.height - 150) { // Dejamos más margen para el pie de página
        doc.addPage();
        finalY = percentageOfPageY(5);
      }
    };

    // Generar las filas de los artículos
    order?.articles?.forEach((article, i) => {
      checkAndAddPage(); // Verifica si necesita una nueva página antes de cada fila

      const yRow = finalY;

      doc.save().moveTo(xTable, yRow).lineTo(percentageOfPageX(100 - firstXTable), yRow).lineTo(percentageOfPageX(100 - firstXTable), yRow + percentageOfPageY(7)).lineTo(xTable, yRow + percentageOfPageY(7)).fill(i % 2 ? "#CCCCCC" : "#EEEEEE");

      const texts = [
        { value: article?.quantity },
        { notText: true, value: `./uploads/articles/${article?.customArticle ? "custom/" : ""}${article?.article?._id || article?.customArticle?._id}/thumbnail.png` },
        { value: article?.article ? article?.article["description"] : article?.customArticle["detail"] },
        { value: article?.price || 0 },
        { value: (article?.price || 0) * (article?.quantity || 0) }
      ];

      texts.forEach((text, iText) => {
        if (text?.notText) {
          doc.image(text?.value, percentageOfPageX(firstXTable + (!iText ? 3 : 18 * iText)), yRow + percentageOfPageY(0.25), { fit: [percentageOfPageX(12), percentageOfPageY(6.5)], align: 'center', valign: 'center' });
        } else {
          doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-SemiBold.ttf`).fontSize(iText != 2 ? 10 : 8)

          // Calculamos la altura del texto
          const containerWidth = percentageOfPageX(12)
          const textHeight = doc.heightOfString(text?.value, { width: containerWidth });

          // Calculamos la posición Y para centrarlo verticalmente
          const yPosition = yRow + (percentageOfPageY(7) - textHeight) / 2

          doc.text(text?.value, percentageOfPageX(firstXTable + (!iText ? 3 : 18 * iText)), yPosition, { width: containerWidth, ellipsis: true });

        }
      });

      finalY = yRow + percentageOfPageY(7); // Actualizar la posición final
    });

    // Total
    checkAndAddPage(); // Verifica si necesita una nueva página para el total
    const totalString = `Total: $${order?.articles?.reduce((acc, art) => acc + ((art?.price || 0) * (art?.quantity || 0)), 0)}`;
    const textWidth = doc.fill("#000000").font(`${assetsPath}/fonts/Montserrat-ExtraBold.ttf`).fontSize(18).widthOfString(totalString);
    const xStartPosition = percentageOfPageX(95) - textWidth;
    doc.text(totalString, xStartPosition, finalY + percentageOfPageY(3), { width: 0, ellipsis: false });

    const firmaString = "Firma y aclaracion"
    const firmaWidth = doc.font(`${assetsPath}/fonts/Montserrat-Regular.ttf`).fontSize(14).widthOfString(firmaString)
    const xFStartPosition = percentageOfPageX(95) - firmaWidth;
    doc.text(firmaString, xFStartPosition, finalY + percentageOfPageY(6), { width: 0, ellipsis: false });

    // TEXTO FINAL "Administración y ventas"
    const pageWidth = doc.page.width;
    const textsFooter = ["Administracion y ventas", isArcan ? "arcan.ventas@gmail.com" : "cattown.ventas@gmail.com", "7709-1657"];
    const distanceBetweenTotal = 12;
    const distanceBetweenTexts = 20;

    // No añadimos una nueva página para estos textos si estamos cerca del final
    finalY += percentageOfPageY(3);
    textsFooter.forEach((text, i) => {
      const textWidth = doc.font(`${assetsPath}/fonts/Montserrat-${!i ? "SemiBold" : "Regular"}.ttf`).fontSize(14).widthOfString(text);
      const textXPosition = (pageWidth - textWidth) / 2;
      doc.text(text, textXPosition, finalY + distanceBetweenTotal + distanceBetweenTexts * i);
    });

    // Agregar el pie de página solo en la última página, sin generar una nueva
    doc.switchToPage(doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1);  // Aseguramos que estamos en la última página
    doc.font(`${assetsPath}/fonts/Montserrat-Regular.ttf`).fontSize(8).text("Documento no válido como factura", percentageOfPageX(5), doc.page.height - 150);
    doc.text("Realizado el " + moment().format('D [de] MMMM [del] YYYY HH:mm'), percentageOfPageX(5), doc.page.height - 120);

    doc.end()
  }


  @Get('/cc/:cid')
  async generateClientExcel(@Param("cid") cid: string, @Res() res: Response) {
    const orders = (await this.ordersService.getOrdersByClient(cid)).filter(o => o.finished)
    const client = await this.clientsService.getClient(cid)
    const payments = await this.paymentsService.getPaymentsByClient(cid)

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

    let items = []

    orders.forEach((order, i) => {
      items.push({ date: moment(order?.finalDate, "DD-MM-YYYY"), text: `Pedido N° ${order?.orderNumber}`, amount: order?.articles?.reduce((acc, art) => acc + ((art?.quantity || 0) * (art?.price || 0) * (order?.mode ? 1.21 : 1)), 0) })
    })

    payments.forEach((payment) => {
      items.push({
        date: moment(payment?.date),
        text: payment?.detail,
        amount: payment?.amount,
        payment: true
      })
    })

    items = items.sort((a, b) => a?.date - b?.date)

    items.forEach((item, i) => {
      const finalStyle = {
        ...styles["cell"], fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: item?.payment ? "#f79999" : "#8efa92",
          fgColor: item?.payment ? "#f79999" : "#8efa92"
        }
      }
      const row = 3 + i
      ws.cell(row, dateCol).string(moment.utc(item?.date).format("DD-MM-YYYY")).style(finalStyle)
      ws.cell(row, motivoCol).string(item?.text).style(finalStyle)
      ws.cell(row, amountCol).number(item?.payment ? -item?.amount : item?.amount).style(finalStyle)
      ws.cell(row, totalCol).formula(`+${i ? xl.getExcelCellRef(row - 1, totalCol) : "0"} + ${xl.getExcelCellRef(row, amountCol)}`).style(finalStyle)
    })

    wb.write(`Cuenta corriente ${client?.name || ""}.xlsx`, res)
  }

  @Get("/articles")
  async generateArticlesExcel(@Query("society") society: string, @Res() res: Response) {
    const articles = await this.articlesService.getArticles(null, null, null, null, society, null, false)
    const wb = new xl.Workbook()
    const ws = wb.addWorksheet(`STOCK ${society?.toUpperCase() || "GENERAL"}`, {
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

    ws.cell(1, 1, 1, 7, true).string(`Resumen de stock`).style(styles["sectionHead"])

    const descriptionCol = 1
    const categoryCol = 2
    const colorCol = 3
    const sizeCol = 4
    const stockCol = 5
    const priceCol = 6
    const bookedCol = 7

    ws.cell(2, descriptionCol).string(`ARTICULO`).style(styles["importantCell"])
    ws.cell(2, categoryCol).string(`CATEGORIA`).style(styles["importantCell"])
    ws.cell(2, colorCol).string(`COLOR`).style(styles["importantCell"])
    ws.cell(2, sizeCol).string(`TALLE`).style(styles["importantCell"])
    ws.cell(2, stockCol).string(`STOCK`).style(styles["importantCell"])
    ws.cell(2, priceCol).string(`PRECIO`).style(styles["importantCell"])
    ws.cell(2, bookedCol).string(`RESERVADO`).style(styles["importantCell"])

    articles?.sort((a,b) => a?.description?.toLowerCase()?.localeCompare(b?.description?.toLowerCase())).forEach((item, i) => {
      const row = 3 + i
      ws.cell(row, descriptionCol).string(item?.description || "").style(styles["cell"])
      ws.cell(row, categoryCol).string(item?.category || "").style(styles["cell"])
      ws.cell(row, colorCol).string(item?.color || "").style(styles["cell"])
      ws.cell(row, sizeCol).string(item?.size || "").style(styles["cell"])
      ws.cell(row, stockCol).number(item?.stock || 0).style({...styles["cell"], numberFormat: ""})
      ws.cell(row, priceCol).number(item?.price || 0).style(styles["cell"])
      ws.cell(row, bookedCol).number(item?.booked || 0).style({...styles["cell"], numberFormat: ""})
    })

    wb.write(`STOCK ${society?.toUpperCase() || "GENERAL"}.xlsx`, res)

  }
}
