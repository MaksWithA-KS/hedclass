export const isAdmin = (req, res, next) => {
    if (req.session.userRole === 'Institutional Administrator') {
        return next();
    }
    res.redirect('/login');
};

export const isOfficer = (req, res, next) => {
    if (req.session.userRole === 'Classification Officer') {
        return next();
    }
    res.redirect('/login');
};