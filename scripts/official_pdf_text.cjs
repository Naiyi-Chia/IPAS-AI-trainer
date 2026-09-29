// Audit-only PDF text cleanup, retained from the #43 source audit.
function cleanOfficialPageFurniture(rawText){
  let text=String(rawText||'').normalize('NFKC').replace(/\r/g,'\n').replace(/[\u00ad\u200b\ufeff]/g,'');
  // Match complete publication headers, not subject names or dates inside a question.
  // NFKC converts ：／， to ASCII; PDF glyph runs can split words and digits with spaces.
  text=text.replace(/1\s*\d\s*\d\s*年\s*第\s*[一二三四]\s*次\s*AI\s*應用規劃師\s*-\s*[初中]級\s*能力鑑定\s*【\s*公\s*告\s*試\s*題\s*】\s*第\s*[一二三]\s*科\s*:\s*[^\n]*?\s*考試日期\s*:\s*[\d\s]+年\s*[\d\s]+月\s*[\d\s]+日(?:\s*試\s*題\s*公告\s*日期\s*:\s*[\d\s]+年\s*[\d\s]+月\s*[\d\s]+日)?/g,'\n');
  text=text.replace(/第\s*\d+\s*頁\s*,?\s*共\s*\d+\s*頁/g,'\n');
  text=text.replace(/答\s*案\s*題\s*目|答\s*題\s*目\s*案/g,'');
  text=text.replace(/^[ \t]*一、\s*選擇題[ \t]*$/gm,'');
  return text;
}


module.exports=cleanOfficialPageFurniture;
