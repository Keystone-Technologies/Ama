-- 1 up
create table if not exists questions (
  id       serial primary key,
  question text not null,
  ts       timestamptz not null default now(),
  username text
);
create table if not exists votes (
  id         serial primary key,
  entry_type text not null,
  entry_id   serial not null,
  vote       text not null,
  ts         timestamptz not null default now(),
  username   text
);
create table if not exists comments (
  id          serial primary key,
  question_id int not null,
  comment     text not null,
  answer      text,
  ts          timestamptz not null default now(),
  username    text
);
insert into questions (question) values ('First element?');
insert into votes (entry_type, entry_id, vote) values ('questions', 1, 'up'), ('questions', 1, 'up'), ('questions', 1, 'down');
insert into comments (question_id, comment) values (1, 'Lithium'), (1, 'Calcium'), (1, 'Hydrogen'), (1, 'Oxygen');
insert into votes (entry_type, entry_id, vote) values
  ('comments', 1, 'down'), ('comments', 1, 'down'), ('comments', 1, 'down'), ('comments', 1, 'up'),
  ('comments', 2, 'down'), ('comments', 2, 'down'), ('comments', 2, 'down'), ('comments', 2, 'down'),
  ('comments', 3, 'up'), ('comments', 3, 'up'), ('comments', 3, 'down'), ('comments', 3, 'up'),
  ('comments', 4, 'down'), ('comments', 4, 'down'), ('comments', 4, 'down');
update comments set answer='anonymous' where id=3;

-- 1 down
drop table if exists questions;
drop table if exists votes;
drop table if exists comments;
