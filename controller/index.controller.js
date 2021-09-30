class indexController {
    home(req, res) {
        return res.render('index/SownEnglish')
    }
}
module.exports = new indexController