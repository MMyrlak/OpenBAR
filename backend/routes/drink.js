import express from 'express';
import { db } from '../lib/dbConfig.js';

const router = express.Router();

// Poberanie wszystkich drinków z bazy
router.get('/', (req, res) => {
  const sql = "SELECT * FROM drink";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Błąd bazy danych!" });
    }
    console.log(result);
    return res.status(200).json(result);
  });
});
// Pobieranie 1 drinka
router.get('/:id', (req, res) => {
  const sql = "SELECT * FROM drink where ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Błąd bazy danych!" });
    }
    console.log(result);
    return res.status(200).json(result);
  });
})

//Dodawanie drinka
router.post('/add', (req, res) => {
  const sql = "INSERT INTO drink (id, drink_name, ingredients, preparation, photo, price, order_count, rating, rating_count, createdAt) VALUES (?)";
  const values = [
    req.body.drink_name, 
    req.body.ingredients, 
    req.body.preparation, 
    req.body.photo,
    req.body.price,
  ];
  db.query(sql, [values], (err,result) => {
    if (err) {
      return res.status(500).json({ message: "Błąd bazy danych!" });
    }
    return res.status(200).json({message: `Dodano drinka ${values[0]}`});
  });
})

//Edytowanie drinka
//axios.put(...)
router.put('/update/:id', (req, res) => {
  const sql = "UPDATE drink SET `drink_name`=?, `ingredients`=? , `preparation` =?, `photo` = ?. `price` = ? WHERE id = ?";
  const id = req.params.id;
  db.query(sql, [req.body.drink_name, req.body.ingredients, req.body.preparation, req.body.photo, req.body.price, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Błąd bazy danych!" });
    }
    console.log(result);
    return res.status(200).json(result);
  });
})

//Usuwanie drinka
//axios.delete(...)
router.delete('/delete/:id', (req,res) => {
  const sql = "DELETE FROM drink WHERE ID = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Błąd bazy danych!" });
    }
    console.log(result);
    return res.status(200).json(result);
  });
})
export default router;