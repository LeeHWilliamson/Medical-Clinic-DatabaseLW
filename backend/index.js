import express from 'express';
import mysql from "mysql";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "taekwando1655",
    database: "medical_clinic_database"
});



app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200);
    res.json("Hello this is mr.backend! 乁( ⁰͡ Ĺ̯ ⁰͡ ) ㄏ");
});

// Login route
app.post("/login", (req, res) => {
    const { ID, password } = req.body;
    const q1 = "SELECT * FROM employee WHERE employee_ID = ?";
    const q2 = "SELECT * FROM patient WHERE Medical_ID = ?";
    const q3 = "SELECT * FROM employee_password WHERE employee_ID = ?";
    const q4 = "SELECT * FROM patient_password WHERE medical_ID = ?";

    if (!ID || !password) {
        return res.status(400).json({ message: "ID and password are required." });
    }

    const firstLetter = ID.charAt(0); // Get the first letter
    if (firstLetter === 'E') {
        db.query(q1, [ID], (err, data) => {
            if (err) {
                console.error(err);
                return res.json(err);
            }
            if (data.length > 0) {
                db.query(q3, [ID], (err, passData) => {
                    if (err) {
                        console.error(err);
                        return res.json(err);
                    }
                    if (passData.length > 0) {
                        if (passData[0].password === password) {
                            return res.json(data[0]); // Return employee data
                        } else {
                            return res.json("Password incorrect");
                        }
                    } else {
                        return res.json("Password record not found");
                    }
                });
            } else {
                return res.json("Employee not found");
            }
        });
    } else if (firstLetter === 'M') {
        db.query(q2, [ID], (err, data) => {
            if (err) {
                console.error(err);
                return res.json(err);
            }
            if (data.length > 0) {
                db.query(q4, [ID], (err, passData) => {
                    if (err) {
                        console.error(err);
                        return res.json(err);
                    }
                    if (passData.length > 0) {
                        if (passData[0].password === password) {
                            return res.json(data[0]); // Return patient data
                        } else {
                            return res.json("Password incorrect");
                        }
                    } else {
                        return res.json("Password not found");
                    }
                });
            } else {
                return res.json("Patient not found");
            }
        });
    } else {
        return res.json("ID must start with 'E' or 'M'");
    }
});

// Get doctors
app.get("/doctors", (req, res) => {
    const q = "SELECT * FROM doctors";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Create doctor
app.post("/doctors", (req, res) => {
    console.log(req.body);

    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'Doctor')";
    const employeeValues = [
        req.body.employee_ID,
        req.body.first_name,
        req.body.last_name
    ];

    const q2 = "INSERT INTO doctors (employee_ID, specialty, first_name, last_name, phone_number, work_address, created, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const doctorValues = [
        req.body.employee_ID,
        req.body.specialty,
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.work_address,
        req.body.created,
        req.body.created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, doctorValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into doctors table", details: err });
            }
            return res.json("A doctor has been created successfully!");
        });
    });
});

// Update doctor
app.put("/doctors/:employee_ID", (req, res) => {
    const employee_id = req.params.employee_ID;
    const q1 = "UPDATE doctors SET specialty = ?, first_name = ?, last_name = ?, phone_number = ?, work_address = ? WHERE employee_ID = ?";
    const q2 = "UPDATE employee SET first_name = ?, last_name = ? WHERE employee_ID = ?";

    const values = [
        req.body.specialty,
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.work_address,
        employee_id
    ];

    db.query(q1, values, (err) => {
        if (err) return res.status(500).json(err);

        const employeeValues = [
            req.body.first_name,
            req.body.last_name,
            employee_id
        ];

        db.query(q2, employeeValues, (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Doctor and employee have been updated!");
        });
    });
});

// Delete doctor
app.delete("/doctors/:employee_ID", (req, res) => {
    const employee_id = req.params.employee_ID;
    const q1 = "DELETE FROM doctors WHERE employee_ID = ?";
    const q2 = "DELETE FROM employee WHERE employee_ID = ?";

    db.query(q1, [employee_id], (err) => {
        if (err) return res.status(500).json(err);

        db.query(q2, [employee_id], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Doctor and employee have been deleted!");
        });
    });
});

// Create Office Staff
app.post("/staff/officestaff", (req, res) => {
    const { employee_ID, first_name, last_name, phone_number, email, address, manager, created, creatorID } = req.body;

    const defaultAvailability = 'all day'; // Default availability

    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'OfficeStaff')";
    const employeeValues = [employee_ID, first_name, last_name];

    const q2 = "INSERT INTO officestaff (employee_ID, first_name, last_name, phone_number, email, address, manager, availabilityMon, availabilityTues, availabilityWed, availabilityThurs, availabilityFri, created, creatorID, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const staffValues = [
        employee_ID,
        first_name,
        last_name,
        phone_number,
        email,
        address,
        manager,
        defaultAvailability, // Set availability to 'all day'
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        created,
        creatorID,
        created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, staffValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into officestaff table", details: err });
            }
            return res.json("An Office Staff member has been created successfully!");
        });
    });
});


// Create Billing Staff
app.post("/staff/billingstaff", (req, res) => {
    const { employee_ID, first_name, last_name, phone_number, email, work_address, created, creatorID } = req.body;

    const defaultAvailability = 'all day'; // Default availability

    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'BillingStaff')";
    const employeeValues = [employee_ID, first_name, last_name];

    const q2 = "INSERT INTO billingstaff (employee_ID, first_name, last_name, phone_number, email, address, availabilityMon, availabilityTues, availabilityWed, availabilityThurs, availabilityFri, created, creatorID, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const staffValues = [
        employee_ID,
        first_name,
        last_name,
        phone_number,
        email,
        address,
        defaultAvailability, // Set availability to 'all day'
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        created,
        creatorID,
        created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, staffValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into billingstaff table", details: err });
            }
            return res.json("A Billing Staff member has been created successfully!");
        });
    });
});


// Update Office Staff
app.put("/staff/officestaff/:employee_ID", (req, res) => {
    const employee_ID = req.params.employee_ID;
    const { first_name, last_name, phone_number, address } = req.body;

    const query = "UPDATE officestaff SET first_name = ?, last_name = ?, phone_number = ?, address = ? WHERE employee_ID = ?";
    const values = [first_name, last_name, phone_number, address, employee_ID];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.json("Office staff updated successfully!");
    });
});

// Update Billing Staff
app.put("/staff/billingstaff/:employee_ID", (req, res) => {
    const employee_ID = req.params.employee_ID;
    const { first_name, last_name, phone_number, address } = req.body;

    const query = "UPDATE billingstaff SET first_name = ?, last_name = ?, phone_number = ?, address = ? WHERE employee_ID = ?";
    const values = [first_name, last_name, phone_number, address, employee_ID];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.json("Billing staff updated successfully!");
    });
});


// Director view
app.get("/director_view/:employee_ID", (req, res) => {
    const director_id = req.params.employee_ID;

    const q_doctors = `
        SELECT d.employee_ID, d.first_name, d.last_name, d.specialty, esl.working_time, o.name AS office_name, o.location_ID 
        FROM doctors d 
        JOIN employee_schedule_location esl ON d.employee_ID = esl.schedule_ID 
        JOIN office o ON esl.mon_avail = o.location_ID OR esl.tues_avail = o.location_ID OR esl.wed_avail = o.location_ID OR esl.thurs_avail = o.location_ID OR esl.fri_avail = o.location_ID 
        WHERE o.director_ID = ? 
        AND (esl.mon_avail IS NOT NULL OR esl.tues_avail IS NOT NULL OR esl.wed_avail IS NOT NULL OR esl.thurs_avail IS NOT NULL OR esl.fri_avail IS NOT NULL);
    `;

    db.query(q_doctors, [director_id], (err, doctors) => {
        if (err) return res.status(500).json(err);
        if (doctors.length === 0) return res.status(404).json("No doctors found.");

        return res.json(doctors); // Send back the doctors data
    });
});

/*
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
*/
//Doctor view
app.get("/doctor_view/:employee_ID", (req, res) => {
    const doctorId = req.params.employee_ID;

    const q_doctors =
        //"SELECT * FROM employee WHERE employee_ID = ?";
        //'SELECT employee_ID FROM doctors WHERE employee_ID = ?';
        `
    SELECT d.employee_ID, d.first_name, d.last_name, d.specialty, d.availabilityMon, d.availabilityTues, d.availabilityWed, d.availabilityThurs, d.availabilityFri
    FROM doctors d 
    WHERE employee_ID = ?`;
    console.log('executing query:', q_doctors, [doctorId]);
    db.query(q_doctors, [doctorId], (err, doctors) => {
        console.log(doctorId);
        if (typeof doctorId === 'string') {
            console.log('doctorId is a string');
        }
        if (err) return res.status(500).json(err);
        if (doctors.length === 0) return res.status(404).json("No doctors found.");

        return res.json(doctors); // Send back the doctors data
    });
});

app.get("/appointments/:employee_ID", (req, res) => {
    const doctorId = req.params.employee_ID;

    const q_doc_apps =
        `SELECT * 
    FROM appointment 
    WHERE doctorID = ?`;

    console.log('executing query:', q_doc_apps, [doctorId]);
    db.query(q_doc_apps, [doctorId], (err, appointment) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appointment);
    });
});

app.get("/doc_availability/:employee_ID", (req, res) => {
    console.log("req.params.employee_ID for referral is...", req.params.employee_ID);
    const employeeId = req.params.employee_ID;

    const q_doctor_availability =
        `
    SELECT availabilityMon, availabilityTues, availabilityWed, availabilityThurs, availabilityFri
    FROM doctors
    WHERE employee_ID = ?;
    `
    console.log('executing query:', q_doctor_availability, [employeeId]);
    db.query(q_doctor_availability, [employeeId], (err, availability) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(availability);
    });
});

app.put("/update_doc_availability/:employee_ID", (req, res) => {
    const employeeId = req.params.employee_ID;
    //const monAvailability = req.body.monAvailability;
    //console.log("value in req.body.availabilityMon = ", req.body.monAvailability)
    const q_update_availability =
        `
        UPDATE doctors
        SET availabilityMon = ?, availabilityTues = ?, availabilityWed = ?, availabilityThurs = ?, availabilityFri = ?
        WHERE employee_ID = ?;
        `
    const availabilityByDay = [
        req.body.monAvailability,
        req.body.tuesAvailability,
        req.body.wedAvailability,
        req.body.thursAvailability,
        req.body.friAvailability,
    ]
    console.log('executing query:', q_update_availability, [employeeId]);
    db.query(q_update_availability, [...availabilityByDay, employeeId], (err, data) => {
        if (err) {
            return res.json(err);
        }
        return res.json("availability updated");
    });
});

app.get("/get_patient_phone/:patientId", (req, res) => {
    console.log("ID being received at get_patient_phone is",... req.params.patientId)
    const patientId = req.params.patientId;

    const q_retrieve_patient_phone = 
    `
    SELECT home_phone
    FROM patient
    WHERE medical_ID = ?
    `

    db.query(q_retrieve_patient_phone, patientId, (err, data) => {
        if (err) {
            return res.json(err)
        }
        return res.json(data)
    })
})

app.post("/create_referral/:employee_ID", (req, res) => {
    //const employeeId = req.params.employee_ID;
    //console.log("referral contains: ", req);
    console.log(req.body.status);
    const now = new Date();
    const isoString = now.toISOString();
    const mysqlDateTime = isoString.slice(0, 19).replace('T', ' ');
    console.log("the mysql datetime is...", mysqlDateTime);
    console.log("the referral_ID is...", req.body.referral_ID)
    console.log("the originating doctorID is ...", req.body.originating_doctor_ID)
    console.log("the originating doctor contact info is... ", req.body.originating_doctor_contact_info)
    console.log("THE REASON FOR REFERRAL IS...", req.body.reason)
    const q_create_referral =
        `
    INSERT INTO referral (referral_ID, date_created, creatorID, created, patient_contact_info, originating_doctor_ID, originating_doctor_contact_info, receiving_doctor_ID, receiving_doctor_contact_info, patient_ID, reason, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?);
    `
    const values = [
        req.body.referral_ID,
        mysqlDateTime,
        req.body.creatorID, req.body.created,
        req.body.patient_contact_info, req.body.originating_doctor_ID,
        req.body.originating_doctor_contact_info, req.body.receiving_doctor_ID,
        req.body.receiving_doctor_contact_info, req.body.patient_ID,
        req.body.reason, req.body.status,
    ]
    console.log('executing query:', q_create_referral);
    db.query(q_create_referral, [...values], (err, data) => {
        if (err) return res.json("Referral failed, please check values for each field and try again.");
        return res.json("Referral created");
    })

})

//Get Doctor Last name
app.get("/doctor_Lname/:employee_ID", (req, res) => {
    const doctorId = req.params.employee_ID;

    const q_doc_name = "SELECT last_name FROM doctors WHERE employee_ID = ?";

    console.log("executing query", q_doc_name);
    db.query(q_doc_name, [doctorId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        };
        return res.json(results);
    })

})

//View referrals by employee_ID
app.get("/view_referrals/:employee_ID", (req, res) => {
    console.log(req.params);
    const doctorId = req.params.employee_ID;
    const q_referral = "SELECT * FROM referral WHERE receiving_doctor_ID = ?  AND status = ?"

    const values = [
        doctorId, 'not reviewed'
    ]
    console.log('executing query', q_referral)

    db.query(q_referral, [...values], (err, results) => {
        if (err) {
            console.error("Error fetching referrals", err);
            return res.status(500).json(err);
        }
        return res.json(results);
    })
})

//View detailed referral information by referral_ID
app.get("/view_specific_referral/:referral_ID", (req, res) => {
    console.log(req.params);
    const referralId = req.params.referral_ID;
    const q_specific_referral = "SELECT * FROM referral WHERE referral_ID = ?"

    const values = [
        referralId
    ]
    console.log('executing query', q_specific_referral)

    db.query(q_specific_referral, [...values], (err, results) => {
        if (err) {
            console.error("Error fetching referral", err);
            return res.status(500).json(err);
        }
        return res.json(results);
    })
})

app.put("/accept_referral/:referral_ID", (req, res) => {
    const referralId = req.params.referral_ID;
    const q_accept_referral =
        `
    UPDATE referral
    SET status = ?
    WHERE referral_ID = ?;
    `
    const accepted = 'accepted'

    db.query(q_accept_referral, [accepted, referralId], (err, results) => {
        if (err) {
            console.error("Error fetching referral", err);
            return res.status(500).json(err);
        }
        return res.json('referral accepted');
    })

})

app.put("/reject_referral/:referral_ID", (req, res) => {
    const referralId = req.params.referral_ID;
    const q_reject_referral =
        `
    UPDATE referral
    SET status = ?
    WHERE referral_ID = ?;
    `
    const rejected = 'rejected'

    db.query(q_reject_referral, [rejected, referralId], (err, results) => {
        if (err) {
            console.error("Error fetching referral", err);
            return res.status(500).json(err);
        }
        return res.json('referral rejected');
    })

})

app.get("/doc_get_all_patients/:doctorId", (req, res) => {
    const doctorId = req.params.doctorId;
    console.log("doctorId is...", req.params.doctorId);

    const q_all_patients =
    `
    SELECT patient_ID
    FROM doctors_patient
    WHERE doctor_ID = ?
    `
    console.log("executing query", q_all_patients);
    db.query(q_all_patients, [doctorId], (err, results) => {
        if (err) {
            console.error("Error fetching patients", err);
            return res.status(500).json(err);
        }
        return res.json(results);
    })
})



app.get("/doc_get_weight_history/:patients", (req, res) => {
    console.log("HELLO FROM GET_WEIGHT_HISTORY");
    //console.log("req.params in doc_get_weight_history is...", req.body.patients)
    const patientIds = req.params.patients;

    const q_patient_appointments = 

    `
    SELECT patientWeight, dateTime
    FROM appointment
    WHERE patientmedicalID = ?
    `
    db.query(q_patient_appointments, [patientIds]), (err, results) => {
        if (err) {
            console.error("error fetching appointment history", err);
            return res.status(500).json(err);
        }
        return res.json(results)
    }
})

// app.get("/patient_check/:patientId", (req, res) => {
//     const patientId = req.params.patientId

//     const q_check_patient_id =
//     `
//     SELECT medical_ID
//     FROM patient
//     WHERE medical_ID = ?
//     `
//     db.query(q_check_patient, [patientId,])
// })

/*
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
*/

app.get("/nurse_appointments/:employee_ID", (req, res) => {
    const nurseId = req.params.employee_ID;

    const q_nurse_apps =
        `SELECT * 
    FROM appointment 
    WHERE nurseID = ?`;

    console.log('executing query:', q_nurse_apps, [nurseId]);
    db.query(q_nurse_apps, [nurseId], (err, appointment) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appointment);
    });
});

app.get("/view_all_patients/", (req, res) => {

    const q_all_patients =
        `SELECT * 
         FROM patient 
        `;

    console.log('executing query:', q_all_patients);
    db.query(q_all_patients, (err, patient) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(patient);
    });
});

app.post("/nurse_create_patient/:employee_ID", (req, res) => {
    //const employeeId = req.params.employee_ID;
    //console.log("referral contains: ", req);
    console.log(req.body);
    console.log(req.body.medical_ID);
    console.log(req.body.last_name);
    console.log(req.body.first_name);
    console.log(req.body.address);
    // const now = new Date();
    // const isoString = now.toISOString();
    // const mysqlDateTime = isoString.slice(0, 19).replace('T', ' ');

    const q_create_patient =
        `
    INSERT INTO patient (medical_ID, billingID, first_name, last_name, birthdate, address_line_1, city, state, zip, personal_email, home_phone, emergency_contact_info, created, creatorID, last_edited, last_editedID)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    `
    const values = [
        req.body.medical_ID,
        req.body.billingID,
        req.body.first_name,
        req.body.last_name,
        req.body.birthdate,
        req.body.address,
        req.body.city,
        req.body.state,
        req.body.zip,
        req.body.email,
        req.body.home_phone,
        req.body.emergency_contact,
        req.body.date_created,
        req.body.creatorID,
        req.body.last_edited,
        req.body.last_editedID
    ]
    console.log('executing query:', q_create_patient);
    db.query(q_create_patient, [...values], (err, data) => {
        if (err) return res.json("patient failed to create, please check all fields and try again");
        return res.json("patient created");
    })

})

app.post("/nurse_assign_new_patient/:patientID", (req, res) => {
    //const employeeId = req.params.employee_ID;
    //console.log("referral contains: ", req);
    console.log("patient being assigned");
    const patientId = req.params.patientID;
    console.log("the req.params are...", req.params)
    console.log(patientId);
    // console.log(req.body);
    // console.log(req.body.medical_ID);
    // console.log(req.body.last_name);
    // console.log(req.body.first_name);
    // console.log(req.body.address);
    // const now = new Date();
    // const isoString = now.toISOString();
    // const mysqlDateTime = isoString.slice(0, 19).replace('T', ' ');

    const q_assign_new_patient =
        `
    INSERT INTO doctors_patient (doctor_ID, patient_ID)
    VALUES (?,?);
    `
    const values = [
        'E12345678',
        patientId,
    ]
    console.log('executing query:', q_assign_new_patient);
    db.query(q_assign_new_patient, [...values], (err, data) => {
        if (err) return res.json(err);
        return res.json("patient assigned");
    })

})

app.get("/nurse_get_app_history/:patientId", (req, res) => {

    console.log("MESSAGE", req.params)
    const patientId = req.params.patientId
    console.log("patientId is....:)", patientId)

    const q_appointment_history =
        `SELECT patientName, patientWeight, dateTime
         FROM appointment 
         WHERE patientMedicalID = ?
        `;


    console.log('executing query:', q_appointment_history);
    db.query(q_appointment_history, patientId, (err, appointments) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appointments);
    });
});

app.get("/medical_get_patient_name/:patientId", (req, res) => {

    const patientId = req.params.patientId
    console.log("patientId is....:)", patientId)

    const q_patient_name =
        `SELECT first_name, last_name
         FROM patient 
         WHERE medical_ID = ?
        `;


    console.log('executing query:', q_patient_name);
    db.query(q_patient_name, patientId, (err, patientName) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(patientName);
    });
});

//get appointment type
app.get("/nurse_get_appointment_type/:doctorId", (req, res) => {
    const doctorId = req.params.doctorId;
    console.log("hi from index, doctorId is...", doctorId)

    const q_app_type = 
    `
    SELECT specialty
    FROM doctors
    WHERE employee_ID = ?
    `
    db.query(q_app_type, doctorId, (err, appType) => {
        if (err){
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appType)
    });
});

app.post('/patient/:id/appointments/nurse_create_appointment', (req, res) => {
    const medicalId = req.params.id;
    console.log("patName is...", req.body.patName);
    const {
        patName, doctorId, nurseId, nurseName, facility,
        appointmentType, reason, date, timeSlot
    } = req.body;

    const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // 7-digit number
    const appointment_id = `A${randomNumber}`;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const timePattern = /^(\d{1,2}):(\d{2})\s?(am|pm)$/i; // 12-hour format with am/pm

    if (!datePattern.test(date) || !timePattern.test(timeSlot)) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }

    // Convert timeSlot to 24-hour format
    const [, hour, minute, period] = timeSlot.match(timePattern);
    const hour24 = period.toLowerCase() === 'pm' && hour !== '12' ? parseInt(hour) + 12 : period.toLowerCase() === 'am' && hour === '12' ? '00' : hour;
    const formattedDateTime = `${date} ${hour24}:${minute}:00`;
    // First query to retrieve the doctor's name
    console.log('asdf', doctorId)
    const doctorNameQuery = `
        SELECT first_name, last_name
        FROM doctors
        WHERE employee_ID = ?;
    `;

    db.query(doctorNameQuery, [doctorId], (err, doctorResult) => {
        if (err) {
            console.error('Error retrieving doctor name:', err);
            return res.status(500).json({ error: 'Failed to retrieve doctor name.' });
        }

        // Ensure a doctor record was found
        if (doctorResult.length === 0) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        const doctorName = `${doctorResult[0].first_name} ${doctorResult[0].last_name}`;

        // Prepare the SQL query to insert the new appointment
        const query = `
            INSERT INTO appointment 
            (patientName, appointment_ID, patientmedicalID, doctor, nurse, doctorID,
             appointment_type, nurseID, officeID, dateTime, reason, created_by, patientBP, created_at) 
            VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        console.log('asdfasdf', formattedDateTime)
        const values = [
            patName,
            appointment_id,     // appointment_ID
            medicalId,          // patientmedicalID
            doctorName,         // doctor (name of doctor)
            nurseName,          // nurse
            doctorId,           // doctorID
            appointmentType,    // appointment_type
            nurseId,            // nurseID
            facility,           // officeID
            formattedDateTime, // dateTime
            reason,             // reason for the appointment
            medicalId,
            '120/80',
            formattedDateTime,           // created_by (replace with actual user if applicable)
        ];
        console.log('values', values)

        db.query(query, values, (err, result) => {
            if (err) {
                // Check if the error is due to the overdue balance trigger
                if (err.code === 'ER_SIGNAL_EXCEPTION') {
                    return res.status(400).json({ error: 'Cannot create appointment. Patient has an overdue balance older than 30 days.' });
                }
                console.log(err)
                console.error('Error creating appointment:', err);
                return res.status(500).json({ error: 'Failed to create appointment.' });
            }
            res.status(201).json({ message: 'Appointment created successfully.' });
        });
    });
});


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// get Director Office ID
app.get("/director_office/:directorId", (req, res) => {
    const directorId = req.params.directorId;

    const query = "SELECT location_ID FROM office WHERE director_ID = ?";

    db.query(query, [directorId], (err, results) => {
        if (err) {
            console.error('Error fetching director office ID:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.length > 0) {
            return res.json({ officeId: results[0].location_ID });
        } else {
            return res.status(404).json({ message: 'Director not found or no office associated' });
        }
    });
});



// Get patients from doctors_patient table
app.get("/doctors_patient/:doctorId", (req, res) => {
    const doctorId = req.params.doctorId;

    const q = `
        SELECT p.first_name, p.last_name, p.medical_ID, p.home_phone, p.address_line_1, p.address_line_2, p.city, p.state, p.zip, p.personal_email
        FROM patient p
        JOIN doctors_patient dp ON p.medical_ID = dp.patient_ID
        WHERE dp.doctor_ID = ? 
    `;

    db.query(q, [doctorId], (err, patients) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json(err);
        }
        if (patients.length === 0) {
            return res.status(404).json("No patients found for this doctor.");
        }

        return res.json(patients); // Send back the patients data
    });
});

//retrieve office staff and billing staff
app.get("/staff_management", (req, res) => {
    const q = `
        SELECT e.employee_ID, e.first_name, e.last_name, e.role
        FROM employee e
        WHERE e.role IN ('OfficeStaff', 'BillingStaff')
    `;

    db.query(q, (err, staff) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(staff); // Send back the staff data
    });
});

// Get appointments for a specific director's office
app.get("/appointments/:directorId", (req, res) => {
    const directorId = req.params.directorId;

    const q =
        `
SELECT * 
FROM appointment 
WHERE officeID IN (SELECT location_ID FROM office WHERE director_ID = ?)
`;


    db.query(q, [directorId], (err, appointment) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appointment);
    });
});

// get appointment info by AppointmentID
app.get('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    db.query('SELECT * FROM appointment WHERE appointment_ID = ?', [appointmentId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Calculate profit for specific appointment IDs
app.get("/profit", (req, res) => {
    const { appointmentIds } = req.query; // Expecting a comma-separated list of appointment IDs

    if (!appointmentIds) {
        return res.status(400).json({ message: "appointmentIds query parameter is required." });
    }

    const query = `
        SELECT SUM(amountCharged) AS profit
        FROM medical_clinic_database.invoice
        WHERE appointment_ID IN (?)
        AND amountDue = 0;
    `;

    db.query(query, [appointmentIds.split(',')], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        const profit = results[0]?.profit || 0; // Default to 0 if no profit found
        return res.json({ profit });
    });
});

app.get('/total_profit', (req, res) => {
    const q = `SELECT SUM(amountCharged) AS profit FROM invoices WHERE amountDue = 0`;

    db.query(q, (err, results) => {
        if (err) return res.status(500).json(err);
        return res.json({ profit: results[0].profit || 0 }); // Return profit or 0 if no results
    });
});


// get patient info by medical ID, including medical history and family history
app.get('/patient/:id', (req, res) => {
    const medicalId = req.params.id;
    const query = `
        SELECT p.*, 
               mr.height, 
               mr.weight, 
               mr.sex, 
               mr.allergies AS medical_allergies, 
               mh.conditions AS medical_conditions, 
               mh.treatment, 
               mh.medication, 
               mh.diagnosis_date, 
               fh.relation, 
               fh.conditions AS family_conditions 
        FROM patient p
        LEFT JOIN medical_record mr ON p.medical_ID = mr.medical_ID
        LEFT JOIN medical_history mh ON p.medical_ID = mh.medical_ID
        LEFT JOIN family_history fh ON p.medical_ID = fh.medical_ID
        WHERE p.medical_ID = ?
    `;

    db.query(query, [medicalId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/api/patient/:id', (req, res) => {
    const medicalId = req.params.id;
    console.log(medicalId)

    // Query to get the most recent upcoming appointment
    const upcomingAppointmentQuery = `
      SELECT a.dateTime, a.reason, a.doctor, o.name, o.address
      FROM appointment as a
      LEFT JOIN office as o ON a.officeId = o.location_ID
      WHERE a.patientmedicalID = ? AND a.dateTime > NOW()
      ORDER BY a.dateTime ASC
      LIMIT 1;
    `;

    // Query to get the most recent 3 test results
    const recentTestsQuery = `
      SELECT test_name, test_date, result
      FROM test_history
      WHERE medical_ID = ?
      ORDER BY test_date DESC
      LIMIT 3;
    `;

    const top3RecentReferrals = `
        SELECT r1.status, r1.date_reviewed, r1.reason, 
    doc_origin.first_name as origin_first_name, doc_origin.last_name as origin_last_name, 
    doc_receive.first_name as receive_first_name, doc_receive.last_name as receive_last_name
    FROM (
    SELECT patient_ID, originating_doctor_ID, receiving_doctor_ID, status, date_reviewed, reason
    FROM referral 
    WHERE patient_ID = ?
    ORDER BY date_reviewed DESC  
    LIMIT 3  
    ) AS r1
    LEFT JOIN doctors AS doc_origin 
    ON r1.originating_doctor_ID = doc_origin.employee_ID
    LEFT JOIN doctors AS doc_receive
    ON r1.receiving_doctor_ID = doc_receive.employee_ID;
    `




    db.query(upcomingAppointmentQuery, [medicalId], (err1, appointmentResult) => {
        if (err1) {
            return res.status(500).json({ error: 'Failed to fetch upcoming appointment', details: err1 });
        }

        db.query(recentTestsQuery, [medicalId], (err2, testResults) => {
            if (err2) {
                return res.status(500).json({ error: 'Failed to fetch recent test results', details: err2 });
            }

            db.query(top3RecentReferrals, [medicalId], (err3, referralResults) => {
                if (err3) {
                    return res.status(500).json({ error: 'Failed to fetch recent referrals', details: err3 });
                }

                // Handling upcoming appointment and recent test results
                const upcomingAppointment = appointmentResult.length > 0 ? appointmentResult[0] : null;
                const recentTests = testResults.length > 0 ? testResults : null;  // Set to null if no test results
                const recentReferrals = referralResults.length > 0 ? referralResults : null;  // Set to null if no referrals
                // Send response
                res.json({
                    upcomingAppointment: upcomingAppointment,
                    recentTests: recentTests,
                    recentReferrals: recentReferrals

                });
            });

        });
    });
});

app.get('/patient/:id/my_account/personal_information', (req, res) => {
    const medicalId = req.params.id;

    const personInformationQuery = `
       SELECT p.first_name, p.last_name, p.age, p.birthdate, p.address_line_1, p.address_line_2,
              p.city, p.state, p.zip, p.personal_email, p.home_phone, p.work_phone, p.cell_phone
       FROM patient p 
       WHERE p.medical_ID = ?;
    `;

    db.query(personInformationQuery, [medicalId], (err, personalData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve personal information', details: err });
        }

        if (personalData.length === 0) {
            return res.status(404).json({ error: 'No personal information found for the given medical ID' });
        }

        // Format the birthdate to just YYYY-MM-DD
        const formattedBirthdate = new Date(personalData[0].birthdate).toLocaleDateString('en-CA');  // Returns YYYY-MM-DD

        res.json({
            first_name: personalData[0].first_name,
            last_name: personalData[0].last_name,
            age: personalData[0].age,
            birthdate: formattedBirthdate,  // Send the formatted birthdate
            address: {
                line_1: personalData[0].address_line_1,
                line_2: personalData[0].address_line_2,
                city: personalData[0].city,
                state: personalData[0].state,
                zip: personalData[0].zip
            },
            contact: {
                personal_email: personalData[0].personal_email,
                home_phone: personalData[0].home_phone,
                work_phone: personalData[0].work_phone,
                cell_phone: personalData[0].cell_phone
            }
        });
    });
});


app.get('/patient/appointment/availability', (req, res) => {
    const { doctorID, officeID } = req.query;

    if (!doctorID || !officeID) {
        return res.status(400).json({ error: "Please provide both doctorID and officeID" });
    }

    // First query: Get fully booked dates
    const fullyBookedDatesQuery = `
        SELECT 
            DATE(dateTime) AS unavailable_date
        FROM 
            appointment
        WHERE 
            doctorID = ?
        GROUP BY 
            DATE(dateTime)
        HAVING 
            COUNT(*) >= 8
    `;

    // Second query: Get unavailable days based on the doctor's schedule
    const unavailableDaysQuery = `
        SELECT 
            schedule_ID,
            CASE WHEN mon_avail != ? THEN 'Monday' END AS Monday,
            CASE WHEN tues_avail != ? THEN 'Tuesday' END AS Tuesday,
            CASE WHEN wed_avail != ? THEN 'Wednesday' END AS Wednesday,
            CASE WHEN thurs_avail != ? THEN 'Thursday' END AS Thursday,
            CASE WHEN fri_avail != ? THEN 'Friday' END AS Friday
        FROM 
            employee_schedule_location
        WHERE 
            schedule_ID = ?
    `;

    // Execute both queries
    db.query(fullyBookedDatesQuery, [doctorID], (err, fullyBookedResults) => {
        if (err) {
            console.error('Error fetching fully booked dates:', err);
            return res.status(500).json({ error: 'Failed to retrieve fully booked dates' });
        }

        db.query(unavailableDaysQuery, [officeID, officeID, officeID, officeID, officeID, doctorID], (err, unavailableDaysResults) => {
            if (err) {
                console.error('Error fetching unavailable days:', err);
                return res.status(500).json({ error: 'Failed to retrieve unavailable days' });
            }

            // Process unavailable days results to filter out null values
            const unavailableDays = [];
            unavailableDaysResults.forEach(row => {
                if (row.Monday) unavailableDays.push(row.Monday);
                if (row.Tuesday) unavailableDays.push(row.Tuesday);
                if (row.Wednesday) unavailableDays.push(row.Wednesday);
                if (row.Thursday) unavailableDays.push(row.Thursday);
                if (row.Friday) unavailableDays.push(row.Friday);
            });

            // Combine results and send response
            res.json({
                fullyBookedDates: fullyBookedResults.map(row => row.unavailable_date),
                unavailableDays: unavailableDays
            });
        });
    });
});



app.get('/patient/appointments/time_slots', (req, res) => {
    const { doctorID, date, facility } = req.query;
    console.log(doctorID)
    console.log(date)
    console.log(facility)

    if (!doctorID || !date || !facility) {
        return res.status(400).json({ error: "Please provide  doctorID , date and facility" });
    }
    console.log(typeof doctorID, typeof date)
    // SQL query to retrieve time slots
    const query = `
    SELECT 
    DATE(dateTime) AS appointment_date,
    HOUR(dateTime) AS appointment_hour,
    DATE_FORMAT(dateTime, '%h:%i %p') AS time_slot
    FROM 
    appointment
    WHERE 
    doctorID =  ? and date(datetime) = ? and officeID = ?
    ORDER BY
    appointment_hour 
    `;

    db.query(query, [doctorID, date, facility], (err, results) => {
        if (err) {

            console.error('Error fetching time slots:', err);
            return res.status(500).json({ error: 'Failed to retrieve time slots' });
        }
        console.log(results)
        // Respond with the time slots
        res.json({ timeSlots: results.map(row => row.time_slot) });
    });
});


app.get('/patient/:id/appointments/upcoming_appointments', (req, res) => {
    const medicalId = req.params.id;
    console.log('asdfasdfasdfasdfasdfasdf')
    // Query to retrieve all upcoming appointments
    const upcomingAppointmentQuery = `
        SELECT a.dateTime, a.reason, a.doctor, o.name, o.address
        FROM appointment as a 
        LEFT JOIN office as o ON a.officeId = o.location_ID
        WHERE a.patientmedicalID = ? AND a.dateTime > NOW()
        ORDER BY a.dateTime;
    `;

    // Execute the query
    db.query(upcomingAppointmentQuery, [medicalId], (err, upcomingAppointments) => {
        if (err) {
            // Handle error, send a 500 response
            return res.status(500).json({ error: 'Failed to retrieve upcoming appointments', details: err });
        }

        // If there are no upcoming appointments, return an appropriate message
        if (upcomingAppointments.length === 0) {
            return res.status(404).json({ message: 'No upcoming appointments found for this patient' });
        }

        // Send the list of upcoming appointments in the response
        res.json({
            appointments: upcomingAppointments
        });
    });
});

app.post('/patient/:id/appointments/create_appointment', (req, res) => {
    const medicalId = req.params.id;
    const {
        doctorId, nurseId, nurseName, facility,
        appointmentType, reason, date, timeSlot
    } = req.body;

    const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // 7-digit number
    const appointment_id = `A${randomNumber}`;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const timePattern = /^(\d{1,2}):(\d{2})\s?(am|pm)$/i; // 12-hour format with am/pm

    if (!datePattern.test(date) || !timePattern.test(timeSlot)) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }

    // Convert timeSlot to 24-hour format
    const [, hour, minute, period] = timeSlot.match(timePattern);
    const hour24 = period.toLowerCase() === 'pm' && hour !== '12' ? parseInt(hour) + 12 : period.toLowerCase() === 'am' && hour === '12' ? '00' : hour;
    const formattedDateTime = `${date} ${hour24}:${minute}:00`;
    // First query to retrieve the doctor's name
    console.log('asdf', doctorId)
    const doctorNameQuery = `
        SELECT first_name, last_name
        FROM doctors
        WHERE employee_ID = ?;
    `;

    db.query(doctorNameQuery, [doctorId], (err, doctorResult) => {
        if (err) {
            console.error('Error retrieving doctor name:', err);
            return res.status(500).json({ error: 'Failed to retrieve doctor name.' });
        }

        // Ensure a doctor record was found
        if (doctorResult.length === 0) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        const doctorName = `${doctorResult[0].first_name} ${doctorResult[0].last_name}`;

        // Prepare the SQL query to insert the new appointment
        const query = `
            INSERT INTO appointment 
            (appointment_ID, patientmedicalID, doctor, nurse, doctorID,
             appointment_type, nurseID, officeID, dateTime, reason, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        console.log('asdfasdf', formattedDateTime)
        const values = [
            appointment_id,     // appointment_ID
            medicalId,          // patientmedicalID
            doctorName,         // doctor (name of doctor)
            nurseName,          // nurse
            doctorId,           // doctorID
            appointmentType,    // appointment_type
            nurseId,            // nurseID
            facility,           // officeID
            formattedDateTime, // dateTime
            reason,             // reason for the appointment
            medicalId            // created_by (replace with actual user if applicable)
        ];
        console.log('values', values)

        db.query(query, values, (err, result) => {
            if (err) {
                // Check if the error is due to the overdue balance trigger
                if (err.code === 'ER_SIGNAL_EXCEPTION') {
                    return res.status(400).json({ error: 'Cannot create appointment. Patient has an overdue balance older than 30 days.' });
                }
                console.log(err)
                console.error('Error creating appointment:', err);
                return res.status(500).json({ error: 'Failed to create appointment.' });
            }
            res.status(201).json({ message: 'Appointment created successfully.' });
        });
    });
});
app.get('/patient/:id/appointments/doctors', (req, res) => {
    const medicalId = req.params.id;
    console.log('asdfadfad', medicalId)
    // SQL query to retrieve all doctors of a patient, including specialists
    const getDoctorsQuery = `
        select d.specialty, d.first_name, d.last_name, d.employee_ID
    from (select * from doctors_patient 
    where doctors_patient.patient_ID = ?) as dp 
    left join doctors d 
    on dp.doctor_ID = d.employee_ID;

    `;
    // Execute the query
    db.query(getDoctorsQuery, [medicalId], (err, results) => {
        if (err) {
            // Handle error and return 500 status code with error message
            return res.status(500).json({
                error: 'Failed to retrieve doctors for the patient',
                details: err
            });
        }
        console.log(results)
        // If successful, return the results as a JSON response
        return res.json({
            doctors: results
        });
    });


});

app.get('/patient/:id/medical_records/medical_history', (req, res) => {
    const medicalId = req.params.id;

    //this query retrieves all medical records based on medicalId
    const medicalHistoryQuery = `
    select conditions, treatment, diagnosis_date, resolved, medication 
    from medical_history
    where medical_id = ?;
    `
    db.query(medicalHistoryQuery, [medicalId], (err, medicalHistoryData) => {
        if (err) {
            console.error('Error fetching medical history:', err);
            return res.status(500).json({ error: 'Failed to retrieve medical history' });
        }

        // Check if medical history is found
        if (medicalHistoryData.length === 0) {
            return res.status(404).json({ message: 'No medical history found for the provided ID' });
        }

        // Send the medical history data as a response
        res.json({ medicalHistory: medicalHistoryData });
    })
})
app.get('/patient/:id/medical_records/referral_history', (req, res) => {
    const medicalID = req.params.id
    //retrieves all referrals based on medicalId
    const allReferralQuery = `SELECT r1.status, r1.date_created, r1.reason, 
    doc_origin.first_name as origin_first_name, doc_origin.last_name as origin_last_name, 
    doc_receive.first_name as receive_first_name, doc_receive.last_name as receive_last_name
    FROM (
    SELECT patient_ID, originating_doctor_ID, receiving_doctor_ID ,status, date_created,reason
    FROM referral 
    WHERE patient_ID = ?
    ) AS r1
    LEFT JOIN doctors AS doc_origin 
    ON r1.originating_doctor_ID = doc_origin.employee_ID
    LEFT JOIN doctors AS doc_receive
    ON r1.receiving_doctor_ID = doc_receive.employee_ID;`
    db.query(allReferralQuery, [medicalID], (err, referralData) => {
        if (err) {
            console.error('Error fetching referral summary:', err);
            return res.status(500).json({ error: 'Failed to retrieve referral summary' });
        }

        // If no referrals found, return a 404
        if (referralData.length === 0) {
            return res.status(404).json({ message: 'No referrals found for the provided patient ID' });
        }

        // Return the retrieved referral data
        res.json({ referrals: referralData });
    });
})
app.get('/patient/:id/medical_records/test_history', (req, res) => {
    const medicalId = req.params.id
    const recentTestsQuery = `
      SELECT test_name, test_date, result
      FROM test_history
      WHERE medical_ID = ?
      ORDER BY test_date DESC
      LIMIT 3;
    `;
    db.query(recentTestsQuery, [medicalId], (err, testHistoryData) => {
        if (err) {
            console.error('Error fetching test history:', err);
            return res.status(500).json({ error: 'Failed to retrieve test history' });
        }

        // If no tests found, return a 404
        if (testHistoryData.length === 0) {
            return res.status(404).json({ message: 'No test history found for the provided medical ID' });
        }

        // Return the retrieved test history data
        res.json({ tests: testHistoryData });
    });
})

app.listen(3000, () => console.log('Server running on port 3000! (Connected to backend!)'));
