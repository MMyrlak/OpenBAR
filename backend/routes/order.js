import express from 'express';
import { db } from '../lib/dbConfig.js';

const router = express.Router();

// Dodawanie wielu drinków do zamówienia
router.post("/add-drinks", (req, res) => {
    const { user_id, drinks } = req.body;
  
    if (!user_id || !Array.isArray(drinks) || drinks.length === 0) {
        return res.status(400).json({ error: "Nieprawidłowe dane!" });
    }

    // Tworzymy zapytanie do dodania wielu zamówień jednocześnie
    const query = "INSERT INTO orderhistory (user_id, drink_id, amount, status) VALUES ?";
    const values = drinks.map((drink) => [user_id, drink.drink_id, drink.amount, "zamówione"]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error("Błąd zapisu do bazy:", err);
            return res.status(500).json({ error: "Błąd zapisu do bazy!" });
        }
        res.status(201).json({ message: "Zamówienie dodane!", insertedRows: result.affectedRows });
    });
});

  
  // Pobieranie wszystkich zamówień
router.get("/historyAll/", (req, res) => {
    const query = `
        SELECT orderhistory.id, orderhistory.user_id, orderhistory.drink_id, orderhistory.amount, orderhistory.created_at, users.name AS user_name, drinks.name AS drink_name
        FROM orderhistory
        JOIN users ON orderhistory.user_id = users.id
        JOIN drinks ON orderhistory.drink_id = drinks.id
        ORDER BY FIELD(orderhistory.status, 'zamówione', 'gotowe', 'odebrane'), orderhistory.created_at DESC;
        `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Błąd pobierania zamówień:", err);
        return res.status(500).json({ error: "Błąd pobierania zamówień" });
      }
      res.status(200).json(results);
    });
  });
  
  // Pobieranie wszystkich zamówień dla konkretnego użytkownika
  router.get("/history/:user_id", (req, res) => {
    const { user_id } = req.params;
  
    const query = `
      SELECT orderhistory.id, orderhistory.user_id, orderhistory.drink_id, orderhistory.amount, orderhistory.status, orderhistory.isRating, orderhistory.created_at, drinks.name AS drink_name
      FROM orderhistory
      JOIN users ON orderhistory.user_id = users.id
      JOIN drinks ON orderhistory.drink_id = drinks.id
      WHERE orderhistory.user_id = ?
      ORDER BY FIELD(orderhistory.status, 'zamówione', 'gotowe', 'odebrane'), orderhistory.created_at DESC;
    `;
  
    db.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("Błąd pobierania zamówień użytkownika:", err);
        return res.status(500).json({ error: "Błąd pobierania zamówień użytkownika" });
      }
      res.status(200).json(results);
    });
  });

  // Pobieranie zamówień nie odebranych dla konkretnego użytkownika
  router.get("/history/order/:user_id", (req, res) => {
    const { user_id } = req.params;
  
    const query = `
      SELECT orderhistory.id, orderhistory.user_id, orderhistory.drink_id, orderhistory.amount, orderhistory.status, orderhistory.isRating, orderhistory.created_at, drinks.name AS drink_name
      FROM orderhistory
      JOIN users ON orderhistory.user_id = users.id
      JOIN drinks ON orderhistory.drink_id = drinks.id
      WHERE orderhistory.user_id = ?
        AND orderhistory.status NOT LIKE 'odebrane'
      ORDER BY FIELD(orderhistory.status, 'zamówione', 'gotowe', 'odebrane'), orderhistory.created_at DESC;
    `;
  
    db.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("Błąd pobierania zamówień użytkownika:", err);
        return res.status(500).json({ error: "Błąd pobierania zamówień użytkownika" });
      }
      res.status(200).json(results);
    });
  });

   // Odbieranie zamówienia
   router.put('/getOrder', (req, res) => {
    const { user_id, drinks } = req.body;

    if (!user_id || !Array.isArray(drinks) || drinks.length === 0) {
        return res.status(400).json({ error: "Nieprawidłowe dane wejściowe!" });
    }

    const drinkIds = drinks.map(d => d.drink_id);
    const placeholders = drinkIds.map(() => "?").join(", ");

    const query = `
        UPDATE orderhistory 
        SET status = 'odebrane' 
        WHERE user_id = ? 
        AND drink_id IN (${placeholders}) 
        AND status = 'gotowe';
    `;

    db.query(query, [user_id, ...drinkIds], (err, result) => {
        if (err) {
            console.error("Błąd zapisu do bazy:", err);
            return res.status(500).json({ error: "Błąd zapisu do bazy!" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Brak gotowych drinków do odebrania!" });
        }

        res.status(200).json({ message: "Zamówienie odebrane!" });
    });
});



export default router;