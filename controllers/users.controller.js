const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const ENV = require('../config/env');

const UsersModel = require('../models/users.model');

const register =  async (req, res) => {
  try {
    const passewordHashed = await bcrypt.hash(req.body.password, 10);
    
    const user = await UsersModel.create({
      ...req.body,
      password: passewordHashed
    });

    res.status(201).json({
      message: "User created !",
      user
    });
  } catch (error) {
    console.log(error.message);
  }
} 

const sign = async (req, res) => {
  try {
    // Recherche l'utilisateur dans 
		// la base de données par son email
    const user = await UsersModel.findOne({ email: req.body.email });
    // si l'utilisateur n'est pas trouvé, 
		// renvoie une erreur 404.
    if(!user) return res.status(404).json("User not found !"); 

    // Compare le mot de passe fourni dans la requête 
		// avec le mot de passe de l'utilisateur (qui est dans la bdd)
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    )

    // Si le mot de passe est incorrect, 
		// renvoie une erreur 400.
    if(!comparePassword) return res.status(400).json("Wrong Credentials!");

    const token = jwt.sign(
      { id: user._id},
      ENV.TOKEN_SIGNATURE,
      {expiresIn: "24h"}
    )


    const { password, ...others } = user._doc

    // Envoie le jeton (token) JWT sous forme de cookie HTTPOnly
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'strict', // Protège des attaques CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24h en millisecondes
    })
    res.status(200).json(others)

  } catch (error) {
     res.status(500).json(error.message) 
  }
}

const get_all_users = async (req, res) => {
  try {
    const users = await UsersModel.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error.message)
  }
}


module.exports = {
  register,
  sign,
  get_all_users
}