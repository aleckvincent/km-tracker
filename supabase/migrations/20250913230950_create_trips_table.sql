create table trips (
                     id bigint generated always as identity primary key,
                     departure_date_time timestamp not null,
                     origin text not null,
                     destination text not null,
                     distance_km numeric(6,2) not null,
                     created_at timestamp default now()
);
