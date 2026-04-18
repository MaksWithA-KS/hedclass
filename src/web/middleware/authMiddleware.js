// Role-Based Access Control Middleware

export const isAdmin = (req, res, next) => {
    // Checks that a session exists and verifies the session holds the exact Administrator string
    if (req.session && req.session.userRole === 'Institutional Administrator') {
        // Authentication passed - hand over control to controller
        return next();
    }
    res.redirect('/login');
};

export const isOfficer = (req, res, next) => {
    // Checks that a session exists and verifies the session holds the exact Officer string
    if (req.session && req.session.userRole === 'Classification Officer') {
        // Authentication passed
        return next();
    }
    // Redirect unauthorised access
    res.redirect('/login');
};