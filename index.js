const port = process.env.PORT || 8000;
const express = require('express');
const app = express();

const multer = require('multer');
const upload = multer({ dest: 'tmp/' });

const sharp = require('sharp');
const fs = require('fs')

app.post('/upload', upload.single('file'), (req, res) => {
	try {
		console.log(req.file.path);
		var outpath = (req.file.path + '_out.jpg'); //処理後のファイル名
		sharp(req.file.path)
			.jpeg({
				quality: 75
			})
			.toFile(outpath, (err, info) => {
				console.log(info);
				var outfile = fs.readFileSync(outpath);
				var dlfilename = req.file.filename + '_out.jpg'
				res.set({'Content-Disposition': `attachment; filename=${dlfilename}`});
				res.send(outfile);
				fs.unlinkSync(req.file.path);
				fs.unlinkSync(outpath);
			});
	} catch(e) {
		res.status(500).send('Error');
		console.log(e);
	};
});

app.listen(port, () => {
	console.log('Server listen on port ' + port)
});
