//@target indesign

// this is not a npm right now...
// from https://github.com/signalwerk/indesign.base
import signalwerkFile from "./node_modules/indesign.base/src/base/file.js";

let f = new signalwerkFile();
let doc = app.activeDocument;
let path = doc.filePath.fsName;

let _log = [];
let _export = [];

let textExport = 0;
let log = (msg, indent) => {
  _log.push(`${Array(indent || 0).join(" ")}${msg}`);
};
let exp = exp => {
  _export.push(`${exp}`);
};

function pad(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// export to icml
let exportICML = item => {
  textExport++;
  var filename = path + "/story/export-" + pad(textExport, 4) + ".icml";

  f.remove(filename);
  item.parentStory.exportFile(ExportFormat.INCOPY_MARKUP, new File(filename));
  exp(filename);
};

let exportImg = (item, indent) => {
  let link = item.itemLink;

  let file = new File(link.linkResourceURI);
  log(`img - ${file.absoluteURI}`, indent);
  exp(file.absoluteURI);
};

let exportItem = (item, _indent) => {
  let indent = _indent + 2;
  switch (item.constructor.name) {
    // case "Character":
    // case "Word":
    // case "TextStyleRange":
    // case "Line":
    // case "Paragraph":
    // case "Text":
    // case "TextColumn":
    // case "Cell":
    // case "InsertionPoint":
    // case "Table":
    // case "Group":
    // case "GraphicLine":
    // case "Rectangle":
    // case "Oval":
    // case "Polygon":
    // case "TextFrame":

    case "PICT":
      exportImg(item, indent);

      break;

    case "Image":
      exportImg(item, indent);

      break;

    case "Rectangle":
      log(`${item.constructor.name}`, indent);
      // let images = item.images.everyItem().getElements();
      let graphics = item.graphics.everyItem().getElements();

      // if (images.length > 0) {
      //   alert("images")
      //   images.forEach(image => {
      //     exportItem(image, indent);
      //   });
      // }
      if (graphics.length > 0) {
        graphics.forEach(graphic => {
          exportItem(graphic, indent);
        });
      }

      break;
    case "TextFrame":
      log(`${item.constructor.name} – export!`, indent);

      exportICML(item);
      // let stories = item.stories.everyItem().getElements();
      //
      // if (stories.length > 0) {
      //   stories.forEach(image => {
      //     exportItem(image, indent);
      //   });
      // }

      break;

    case "Group":
      // log(`${item.constructor.name} – export!`, indent);
      item.allPageItems.forEach(groupMember => {
        exportItem(groupMember, indent);
      });

      break;
    default:
      log(`ERROR!!!! ${item.constructor.name}`, indent);
  }
};

doc.articles
  .everyItem()
  .getElements()
  .forEach((article, aIndex) => {
    log(article.name);

    article.articleMembers
      .everyItem()
      .getElements()
      .forEach((articleMember, amIndex) => {
        exportItem(articleMember.itemRef, 2);
      });
  });

f.write(`${path}/info.txt`, _log.join("\n"));
f.write(`${path}/export.txt`, _export.join("\n"));

alert("done");
