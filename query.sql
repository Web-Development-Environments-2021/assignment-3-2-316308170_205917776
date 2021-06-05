CREATE TABLE Matches(
    Match_ID INTEGER NOT NULL UNIQUE,
    Home_Team_ID INTEGER,
    Away_Team_ID INTEGER,
    Match_Date VARCHAR(20),
    Hour VARCHAR(5),
    Stadium VARCHAR(50),
    Stage INTEGER,
    Score VARCHAR(10),
    EventBook VARCHAR(500),
    Referee_ID INTEGER
);

CREATE TABLE Users(
    Username VARCHAR(50) NOT NULL UNIQUE,
    First_name VARCHAR(50),
    Last_name VARCHAR(50),
    User_Password VARCHAR(64),
    Country VARCHAR(50),
    Email VARCHAR(50),
    User_Role VARCHAR(15)
);

CREATE TABLE Favorite_Matches(
    Username VARCHAR(50),
    Match_ID INTEGER
);

CREATE TABLE Favorite_Players(
    Username VARCHAR(50),
    Player_ID INTEGER
);

CREATE TABLE Favorite_Teams(
    Username VARCHAR(50),
    Team_ID INTEGER
);

CREATE TABLE Referees(
    Referee_ID INTEGER NOT NULL UNIQUE,
    Full_name VARCHAR(50)
);

INSERT INTO Referees  VALUES 
('1','Sapir Berman'),
('2', 'Liad Oz'),
('3','Tom Robissa'),
('4','Shaked Almog'),
('5','Naor Suban');


DROP TABLE Matches
-- DROP TABLE Users
DROP TABLE Favorite_Matches
DROP TABLE Favorite_Teams
DROP TABLE Favorite_Players
-- DROP TABLE Referees