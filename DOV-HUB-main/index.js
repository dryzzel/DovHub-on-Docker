require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 15 * 24 * 60 * 60 * 1000
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexión a MongoDB Atlas exitosa"))
    .catch(err => console.error("Error conectando a DB:", err));

const userSchema = new mongoose.Schema({
    user: String,
    pass: String,
    email: String,
    fullName: String,
    team: String,
    rank: String,
    status: String,
    rcExtension: String,
    code: String
}, { collection: 'Staff' });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {

    if (req.session.agent) return res.redirect('/index');
    res.render('entry');
});

app.post('/log', async (req, res) => {
    const { username, password } = req.body;

    try {
        const agent = await User.findOne({ user: username });

        if (!agent) {
            console.log('Usuario no encontrado');
            return res.redirect('/');
        }

        const match = await bcrypt.compare(password, agent.pass);

        if (match) {
            req.session.agent = agent;
            return res.redirect('/index');
        } else {
            console.log('Contraseña incorrecta');
            return res.redirect('/');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Error del servidor");
    }
});

app.get('/index', (req, res) => {
    if (!req.session.agent) return res.redirect('/');

    const { rank } = req.session.agent;
    const canViewManagement = rank !== "Agent" && rank !== "TL" && rank !== "SubTL";
    const isAdmin = rank === "Admin";

    res.render('index', {
        user: req.session.agent.user,
        rank: rank,
        team: req.session.agent.team,
        fullName: req.session.agent.fullName,
        code: req.session.agent.code,
        canViewManagement,
        isAdmin
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Admin authentication middleware
function requireAdmin(req, res, next) {
    if (!req.session.agent) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    if (req.session.agent.rank !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    next();
}

// Admin page route
app.get('/admin', (req, res) => {
    if (!req.session.agent) return res.redirect('/');
    if (req.session.agent.rank !== 'Admin') {
        return res.status(403).send('Acceso denegado. Solo administradores.');
    }

    res.render('admin', {
        user: req.session.agent.user,
        rank: req.session.agent.rank,
        fullName: req.session.agent.fullName
    });
});

// API: Get all users
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { user: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { fullName: { $regex: search, $options: 'i' } },
                    { team: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query).select('-pass');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// API: Create new user
app.post('/api/users', requireAdmin, async (req, res) => {
    try {
        const { user, pass, email, fullName, team, rank, code } = req.body;

        // Validate required fields
        if (!user || !pass) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ user });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(pass, 10);

        // Create new user
        const newUser = new User({
            user,
            pass: hashedPassword,
            email: email || '',
            fullName: fullName || '',
            team: team || '',
            rank: rank || 'Agent',
            status: status || 'Active',
            rcExtension: rcExtension || '',
            code: code || '000'
        });

        await newUser.save();

        // Return user without password
        const userResponse = newUser.toObject();
        delete userResponse.pass;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// API: Update user
app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { user, pass, email, fullName, team, rank, status, rcExtension, code } = req.body;

        const updateData = {};
        if (user !== undefined) updateData.user = user;
        if (email !== undefined) updateData.email = email;
        if (fullName !== undefined) updateData.fullName = fullName;
        if (team !== undefined) updateData.team = team;
        if (rank !== undefined) updateData.rank = rank;
        if (status !== undefined) updateData.status = status;
        if (rcExtension !== undefined) updateData.rcExtension = rcExtension;
        if (code !== undefined) updateData.code = code;

        // Only update password if provided
        if (pass && pass.trim() !== '') {
            updateData.pass = await bcrypt.hash(pass, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-pass');

        if (!updatedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// API: Delete user
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor DOV seguro corriendo en http://localhost:${PORT}`);
});