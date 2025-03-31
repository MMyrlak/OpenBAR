import express from 'express';
import { db } from '../lib/dbConfig.js';
import { authenticateToken } from '../lib/authenticateToken.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const router = express.Router();

//Ocenianie drinka
router.put('/rating/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const { drink_id, rating } = req.body;

    // Sprawdzenie, czy ocena jest w odpowiednim zakresie
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Ocena musi być liczbą od 1 do 5!" });
    }

    // Zapytanie do tabeli orderhistory, aby oznaczyć oceniony drink
    const sqlRatingOrder = `
        UPDATE orderhistory 
        SET isRating = 1 
        WHERE user_id = ? 
        AND drink_id = ? 
        AND status = 'odebrane';
    `;

    // Zapytanie do tabeli drink, aby zaktualizować średnią ocenę
    const sqlRatingDrink = `
        UPDATE drink
        SET rating = ((rating * rating_count) + ?) / (rating_count + 1),
            rating_count = rating_count + 1
        WHERE drink_id = ?
    `;

    // Rozpoczynamy transakcję, aby mieć pewność, że obie operacje się wykonają
    db.beginTransaction((err) => {
        if (err) {
            console.error("Błąd rozpoczęcia transakcji:", err);
            return res.status(500).json({ error: "Błąd transakcji!" });
        }

        // Pierwsza operacja: zaktualizowanie statusu w orderhistory
        db.query(sqlRatingOrder, [user_id, drink_id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Błąd zapisu w orderhistory:", err);
                    return res.status(500).json({ error: "Błąd zapisu w orderhistory!" });
                });
            }
            // Druga operacja: zaktualizowanie ocen w tabeli drink
            db.query(sqlRatingDrink, [rating, drink_id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Błąd zapisu w drink:", err);
                        return res.status(500).json({ error: "Błąd zapisu w drink!" });
                    });
                }

                // Jeśli obie operacje zakończyły się sukcesem, zatwierdzamy transakcję
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Błąd zatwierdzenia transakcji:", err);
                            return res.status(500).json({ error: "Błąd zatwierdzenia transakcji!" });
                        });
                    }

                    // Zwróć sukces
                    res.status(200).json({ message: "Ocena została dodana!" });
                });
            });
        });
    });
});

//Edytowanie użytkownika
router.put('/edit/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const values = req.body;
    const sql = `
        UPDATE user
        SET email = ?, fullname = ?, birthday = ?
        WHERE id = ?
    `;
    db.query(sql, [values, user_id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Błąd bazy danych!" });
        }
        console.log(result);
        return res.status(200).json({ message: "Dane zostały zaakutlizowane, jeśli nie widzisz zmian odśwież stronę" });
    });
});
//Dane użytkownika
router.get('/:id', authenticateToken , (req,res) => {
    const id = req.params.id;
    const sql = `SELECT email, fullname, birthday FROM user WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Błąd bazy danych!" });
        }
        console.log(result);
        return res.status(200).json(result);  
    })
})
//Rejestracja użytkownika
router.put('/addUser', (req, res) => {
    const { email, password, fullname, birthday } = req.body;

    const sql = `SELECT email FROM user WHERE email = ?`;
    const salt = parseInt(process.env.SALT, 10) || 12;

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Błąd bazy danych:", err);
            return res.status(500).json({ message: "Błąd bazy danych!" });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "Użytkownik o podanym e-mail już istnieje" });
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.error("Błąd przy hashowaniu hasła:", err);
                return res.status(500).json({ message: "Błąd przy hashowaniu hasła" });
            }


            const insertSql = "INSERT INTO user (email, password, fullname, birthday, role) VALUES (?, ?, ?, ?, 'user')";

            db.query(insertSql, [email, hash, fullname, birthday ], (err, result) => {
                if (err) {
                    console.error("Błąd SQL:", err);
                    return res.status(500).json({ message: "Błąd bazy danych przy dodawaniu użytkownika!", error: err });
                }
                return res.status(201).json({ message: "Użytkownik dodany pomyślnie!" });
            });
        });
    });
});

// Logowanie użytkownika
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email i hasło są wymagane!" });
    }

    const sql = "SELECT * FROM user WHERE email = ?";
    
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Błąd bazy danych:", err);
            return res.status(500).json({ message: "Błąd serwera!" });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: "Nieprawidłowy email lub hasło!" });
        }

        const hashedPassword = result[0].password;

        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                console.error("Błąd porównywania haseł:", err);
                return res.status(500).json({ message: "Błąd serwera!" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Nieprawidłowy email lub hasło!" });
            }
            const secretKey = process.env.JWTSECRETKEY;
            const fullname = result[0].fullname;
            const role = result[0].fullname;
            const email = result[0].email;
            const birthday = result[0].birthday;
            const token = jwt.sign({fullname, role, email, birthday}, secretKey, {expiresIn: '1d'});

            return res.status(200).json({ message: "Zalogowano pomyślnie!", token });
        });
    });
});

// Endpoint weryfikujący token
router.get('/verify-token', authenticateToken, (req, res) => {
    // Jeśli token jest prawidłowy, użytkownik przechodzi tutaj
    res.status(200).json({ message: 'Token jest ważny!', user: req.user });
});
export default router;