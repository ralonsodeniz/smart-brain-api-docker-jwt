BEGIN TRANSACTION;

INSERT into users
    (name, email, entries, joined)
values
    ('Jessie', 'jessie@gmail.com', 5, '2018-01-01');

INSERT into login
    (hash, email)
values('$2y$12$kVekSpHqb8Wf7.dRXbLvyeJTR9VCkeTvaF8UcO9dd34T/fWE4u2W6', 'jessie@gmail.com');

COMMIT;