import puppeteer from 'puppeteer';
import hbs from 'handlebars';
import path from 'path';
import fs from 'fs-extra';
import moment from 'moment';

export const compileTemplate = async (templateName, data) => {    
  hbs.registerHelper('asc', (i) => {
   return i+1; 
  });
  hbs.registerHelper('dateFormat', () => {
    return moment().format('MMMM Do,YYYY');
  });
  hbs.registerHelper('momentMonth',(date)=>{
    return moment(date).format('MMMM');
  });
  hbs.registerHelper('equalsTo',(text)=>{
    const values=data.result.map(r=>r.LedgerName);
    const isExists=values.includes(text);
    return isExists;
   
  })
 // const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  let filePath=  'c:\\Users\\user\\Desktop\\PgrpServer\\account-api\\src\\utils\\templates\\';
  if(templateName=='journaltable'){
    filePath=filePath+templateName+'.hbs';
  }
  if(templateName=='ledgertable'){
    filePath=filePath+templateName+'.hbs';
  }
  if(templateName=='trialbalance'){
    filePath=filePath+templateName+'.hbs';
  }
  if(templateName=='balancesheet'){
    filePath=filePath+templateName+'.hbs';
  }
  if(templateName=='pl'){
    filePath=filePath+templateName+'.hbs';
  }
 
  const html = await fs.readFile(filePath, 'utf-8');
  return hbs.compile(html)(data);
};

export const pdfGenerateByHtml = async (content) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(content);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({
      path: 'journal.pdf',
      format:'a4',
      printBackground: true,
    });
    await browser.close();
    return pdf;
  } catch (err) {
    return err;
  }
};