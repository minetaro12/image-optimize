import fs from 'fs';


//一時ファイルの削除
const remove = function(file: string) {
  try {
    if(fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed: ${file}`);
    } else {
      console.log(`Skip: ${file}`);
    };
  } catch(e) {
    console.log('Remove Error');
  };
};

export default remove;