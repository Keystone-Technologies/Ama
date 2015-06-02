-- 1 up
create table if not exists questions (
  id       serial primary key,
  question text not null,
  created  timestamptz not null default now(),
  modified timestamptz not null default now(),
  username text not null
);
create table if not exists votes (
  id         serial primary key,
  entry_type text not null,
  entry_id   serial not null,
  vote       text not null,
  created    timestamptz not null default now(),
  modified   timestamptz not null default now(),
  username   text not null
);
create table if not exists comments (
  id          serial primary key,
  question_id int not null,
  comment     text not null,
  answer      text,
  created     timestamptz not null default now(),
  modified    timestamptz not null default now(),
  answered    timestamptz,
  username    text not null
);
insert into questions (question, username) values ('First element?', 'anonymous');
insert into votes (entry_type, entry_id, vote, username) values ('questions', 1, 'up', 'anonymous'), ('questions', 1, 'up', 'anonymous'), ('questions', 1, 'down', 'anonymous');
insert into comments (question_id, comment, username) values (1, 'Lithium', 'anonymous'), (1, 'Calcium', 'anonymous'), (1, 'Hydrogen', 'anonymous'), (1, 'Oxygen', 'anonymous');
insert into votes (entry_type, entry_id, vote, username) values
  ('comments', 1, 'down', 'anonymous'), ('comments', 1, 'down', 'anonymous'), ('comments', 1, 'down', 'anonymous'), ('comments', 1, 'up', 'anonymous'),
  ('comments', 2, 'down', 'anonymous'), ('comments', 2, 'down', 'anonymous'), ('comments', 2, 'down', 'anonymous'), ('comments', 2, 'down', 'anonymous'),
  ('comments', 3, 'up', 'anonymous'), ('comments', 3, 'up', 'anonymous'), ('comments', 3, 'down', 'anonymous'), ('comments', 3, 'up', 'anonymous'),
  ('comments', 4, 'down', 'anonymous'), ('comments', 4, 'down', 'anonymous'), ('comments', 4, 'down', 'anonymous');
update comments set answer='anonymous' where id=3;

-- 1 down
drop table if exists questions;
drop table if exists votes;
drop table if exists comments;
