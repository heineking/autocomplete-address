CREATE TABLE Addresses (
  Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  [Number] TEXT NULL,
  Street TEXT NULL,
  City TEXT NULL,
  Region TEXT NULL,
  Postcode TEXT NULL,
  Unit TEXT NULL,
  Building TEXT NULL,
  [Floor] TEXT NULL,
  Lat REAL NULL,
  Lon REAL NULL
);

CREATE INDEX idx_addresses_number
ON Addresses (number);

CREATE INDEX idx_addresses_street
ON Addresses (street);

CREATE INDEX idx_addresses_lat
ON Addresses (Lat);

CREATE INDEX idx_addresses_lon
ON Addresses (Lon);

.mode csv
.separator |
.import ../addresses.csv Addresses