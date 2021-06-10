const sqlite = require('sqlite3');
const crypto = require('crypto');
const { error } = require('console');

const db = new sqlite.Database('./gate_opener.sqlite', sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }

    console.log('Connected to the gate_opener database');
});

exports.get_users = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM user`, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (rows)
                    resolve(rows);
                else
                    resolve(null);
            });
        })
    })
}

exports.has_user_privilege = (user, hash) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`select top_privilege from user where name=? and password=?`,
            [user, hash],
            (err, row) => {
                if(err){
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if(row){
                    if(row.top_privilege === 1)
                        resolve(true);
                    else
                        resolve(false);
                }
                else{
                    reject({error:"User or password are incorrect"});
                }
            })
        })
    })
}

exports.get_all_triggers = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT user.name as user,
                          device.name as device,
                          datetime(time, 'localtime') as trigger_time
                   FROM trigger
                   JOIN user on trigger.user = user.name
                   JOIN device on trigger.device = device.id`, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (rows)
                    resolve(rows);
                else
                    resolve(null);
            });
        });
    });
}

exports.get_triggers = (start, end) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT user.name as user,
                          device.name as device,
                          datetime(time, 'localtime') as trigger_time
                   FROM trigger
                   JOIN user on trigger.user = user.name
                   JOIN device on trigger.device = device.id
                   WHERE trigger_time <= ? and trigger_time >= ?`,[end, start], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (rows)
                    resolve(rows);
                else
                    resolve(null);
            });
        });
    });
}

exports.get_devices = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM device`, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (rows)
                    resolve(rows);
                else
                    resolve(null);
            });
        });
    })

}

exports.insert_trigger = (user, device, status) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT INTO trigger (user, device, status) VALUES (?,?,?)`,
                [user, device, status], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                        return;
                    }

                    if (row)
                        resolve(row);
                    else
                        resolve(null);
                });
        })
    })

}

exports.insert_user = (name, password, privilege) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT INTO user (name, password, salt, top_privilege, start_date, end_date, left_uses) 
        VALUES (?,?,?,?,?,?,?)`,
                [name, hash, salt, 0, privilege.start_date, privilege.end_date, privilege.left_uses],
                (err) => {
                    if (err) {
                        console.error(err.message);
                        resolve('error')
                        return;
                    }

                    resolve('ok');
                });
        })
    })

}

exports.insert_top_user = (name, password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT INTO user (name, password, salt) 
            VALUES (?,?,?)`,
                [name, hash, salt],
                (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                        return;
                    }

                    if (row)
                        resolve(row);
                    else
                        resolve(null);
                });
        })
    })

}

exports.login = (user, psw) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT * FROM user WHERE name = ?`, [user], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (rows) {
                    const hash = crypto.createHash('sha256').update(psw + rows.salt).digest('hex');

                    if (hash === rows.password) {
                        resolve(rows);
                        return;
                    }

                    resolve(null);
                }
                else{
                    resolve(null);
                }
            })
        });
    }
    );
}

exports.check_user = (user, hash) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT *, date('now') as time FROM user WHERE name = ? AND password = ?`, [user, hash], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }

                if (row) {                    
                    if (row.top_privilege != 1) {
                        let current = row.time;
                        let start = new Date(row.start_date).toISOString().split('T')[0];
                        let end = new Date(row.end_date).toISOString().split('T')[0];

                        if (row.left_uses > 0 && current <= end && current >= start) {
                            db.get(`UPDATE user SET left_uses=? WHERE name=?`, [row.left_uses - 1, row.name]);

                            resolve({ status: 'OK', message: `${row.left_uses -1} uses left` });
                        }
                        else
                            resolve({ 
                                status: 'ERROR',
                                error: 'Period of validity has ended or no more uses available'
                             });
                    }
                    else
                        resolve({ status: 'OK', message: 'Top privilege found' });
                }
                else
                    resolve({ status: 'ERROR', error: 'No user found' });
            })
        })
    })

}

exports.close = () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }

        console.log('Closed the database connection.');
    });
}