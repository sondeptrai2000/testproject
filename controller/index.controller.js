class indexController {
    home(req, res) {
        return res.render('index/SownEnglish')
    }
    warning(req, res) {
        return res.render('index/warning')
    }
}
module.exports = new indexController