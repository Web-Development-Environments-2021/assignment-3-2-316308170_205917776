CREATE TABLE Matches(
    Match_ID INTEGER,
    Home_Team_ID INTEGER,
    Away_Team_ID INTEGER,
    Referee_ID INTEGER,
    Match_Date VARCHAR(20),
    Stadium VARCHAR(50),
    Stage INTEGER,
    Score VARCHAR(10),
    EventBook VARCHAR(500)
);

CREATE TABLE Users(
    Username VARCHAR(50),
    First_name VARCHAR(50),
    Last_name VARCHAR(50),
    User_Password VARCHAR(64),
    Country VARCHAR(50),
    User_Role VARCHAR(15)
);

CREATE TABLE Favorites(
    Username VARCHAR(50),
    Match_ID INTEGER
);
-- DROP TABLE Matches
-- DROP TABLE Users