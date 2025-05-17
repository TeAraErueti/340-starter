-- Task 1: Insert a new record for Tony Stark (account table)

INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Task 2: Update Tony Stark's account_type to 'Admin'

UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';


-- Task 3: Delete the Tony Stark record

DELETE FROM account
WHERE account_email = 'tony@starkent.com';


-- Task 4: Replace "small interiors" with "a huge interior" in GM Hummer record

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';


-- Task 5: Inner join to get make, model, and classification name for "Sport" classification

SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Task 6: Update inv_image and inv_thumbnail to add "/vehicles" in the path

UPDATE inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
