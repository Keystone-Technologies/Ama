-- 1 up

-- A user can:
--   X post a question and submit an up vote
--   X post a comment on any unanswered question and submit an up vote
--   X edit their own question
--   X edit their own comment
--   X delete their own question
--   X delete their own comment
--   X vote one time on any unanswered question not their own
--   X vote one time on any unanswered question's comment not their own comment
--   X flag an unflagged question not their own
--   X unflag a flagged question that they originally flagged
--   X flag an unflagged question's comment not their own
--   X unflag a flagged question's comment that they originally flagged
--   X mark a comment (including their own) of their own question as an answer
--   X unmark a comment (including their own) of their own question as not the answer
--   X mark a new comment (including their own) of their own question as an answer and unmarking the prior mark



create table if not exists questions (
  question_id serial primary key,
  question    text not null,
  username    text not null,
  created     timestamptz not null default now(),
  modified    timestamptz not null default now()
);
insert into questions (question, username) values
  ('What is the first element of the periodic table of elements?', 'anonymous1'),
  ('What is the second element of the periodic table of elements?', 'anonymous1'),
  ('What is the third element of the periodic table of elements?', 'anonymous2');

create table if not exists comments (
  comment_id  serial primary key,
  question_id int not null REFERENCES questions on delete cascade,
  comment     text not null,
  username    text not null,
  created     timestamptz not null default now(),
  modified    timestamptz not null default now()
);
insert into comments (question_id, comment, username) values
  (1, 'Lithium', 'anonymous1'), (1, 'Calcium', 'anonymous2'), (1, 'Hydrogen', 'anonymous3'), (1, 'Oxygen', 'anonymous4'),
  (2, 'Lithium', 'anonymous1'), (2, 'Calcium', 'anonymous2'), (2, 'Helium', 'anonymous3'), (2, 'Oxygen', 'anonymous4'),
  (3, 'Lithium', 'anonymous1'), (3, 'Calcium', 'anonymous2'), (3, 'Hydrogen', 'anonymous3'), (3, 'Oxygen', 'anonymous4');

create table if not exists answers (
  question_id int not null REFERENCES questions ON DELETE cascade,
  comment_id  int not null REFERENCES comments ON DELETE cascade,
  username    text not null,
  created     timestamptz not null default now(),
  PRIMARY KEY (question_id)
);
insert into answers (comment_id, question_id, username) values
  (3, 1, 'anonymous1'),
  (9, 3, 'anonymous2');
  
create table if not exists votes (
  entry_type  text not null,
  entry_id    int not null,
  vote        text not null CHECK (vote = 'up' or vote = 'down'),
  username    text not null,
  created     timestamptz not null default now(),
  PRIMARY KEY (entry_type, entry_id, username)
);
insert into votes (entry_type, entry_id, vote, username) values
  ('questions', 1, 'up', 'anonymous1'), ('questions', 1, 'up', 'anonymous2'), ('questions', 1, 'down', 'anonymous3'),
  ('questions', 2, 'up', 'anonymous1'), ('questions', 2, 'up', 'anonymous2'), ('questions', 2, 'up', 'anonymous3'),
  ('questions', 3, 'up', 'anonymous1'), ('questions', 3, 'down', 'anonymous2'), ('questions', 3, 'down', 'anonymous3'),
  ('comments', 1, 'down', 'anonymous1'), ('comments', 1, 'down', 'anonymous2'), ('comments', 1, 'down', 'anonymous3'), ('comments', 1, 'up', 'anonymous4'),
  ('comments', 2, 'down', 'anonymous1'), ('comments', 2, 'down', 'anonymous2'), ('comments', 2, 'down', 'anonymous3'), ('comments', 2, 'down', 'anonymous4'),
  ('comments', 3, 'up', 'anonymous1'), ('comments', 3, 'up', 'anonymous2'), ('comments', 3, 'down', 'anonymous3'), ('comments', 3, 'up', 'anonymous4'),
  ('comments', 4, 'down', 'anonymous1'), ('comments', 4, 'down', 'anonymous2'), ('comments', 4, 'down', 'anonymous3'),
  ('comments', 5, 'down', 'anonymous1'), ('comments', 5, 'down', 'anonymous2'), ('comments', 5, 'down', 'anonymous3'), ('comments', 5, 'up', 'anonymous4'),
  ('comments', 6, 'down', 'anonymous1'), ('comments', 6, 'down', 'anonymous2'), ('comments', 6, 'down', 'anonymous3'), ('comments', 6, 'down', 'anonymous4'),
  ('comments', 7, 'up', 'anonymous1'), ('comments', 7, 'up', 'anonymous2'), ('comments', 7, 'down', 'anonymous3'), ('comments', 7, 'up', 'anonymous4'),
  ('comments', 8, 'down', 'anonymous1'), ('comments', 8, 'down', 'anonymous2'), ('comments', 8, 'down', 'anonymous3'),
  ('comments', 9, 'down', 'anonymous1'), ('comments', 9, 'down', 'anonymous2'), ('comments', 9, 'down', 'anonymous3'), ('comments', 9, 'up', 'anonymous4'),
  ('comments', 10, 'down', 'anonymous1'), ('comments', 10, 'down', 'anonymous2'), ('comments', 10, 'down', 'anonymous3'), ('comments', 10, 'down', 'anonymous4'),
  ('comments', 11, 'up', 'anonymous1'), ('comments', 11, 'up', 'anonymous2'), ('comments', 11, 'down', 'anonymous3'), ('comments', 11, 'up', 'anonymous4'),
  ('comments', 12, 'down', 'anonymous1'), ('comments', 12, 'down', 'anonymous2'), ('comments', 12, 'down', 'anonymous3');

create table if not exists flags (
  entry_type  text not null,
  entry_id    int not null,
  username    text not null,
  created     timestamptz not null default now(),
  PRIMARY KEY (entry_type, entry_id)
);
insert into flags (entry_type, entry_id, username) values
  ('questions', 2, 'anonymous4'),
  ('comments', 5, 'anonymous3'),
  ('comments', 9, 'anonymous2');
  
  

CREATE OR REPLACE FUNCTION answered(integer) 
RETURNS boolean AS
$BODY$
  declare result integer;
  BEGIN
    select
      COUNT(*) as answered into result
    from
      answers 
    where
      question_id=$1;
    if result is null or result = 0 then
      return 0;
    elsif result >= 1 then
      return 1;
    else
      return null;
    end if;
  END; 
$BODY$ LANGUAGE plpgsql;
  
CREATE OR REPLACE FUNCTION votes(text, integer) 
RETURNS integer AS
$BODY$
  declare result integer;
  BEGIN
    select
      SUM(CASE WHEN vote = 'up' THEN 1 ELSE -1 END) as votes into result
    from
      votes 
    where
      entry_type=$1 and entry_id=$2;
    if result is null then
      return 0;
    else
      return result;
    end if;
  END; 
$BODY$ LANGUAGE plpgsql;
  
CREATE OR REPLACE FUNCTION flagged(text, integer) 
RETURNS boolean AS
$BODY$
  declare result integer;
  BEGIN
    select
      COUNT(*) as flags into result
    from
      flags 
    where
      entry_type=$1 and entry_id=$2;
    if result is null or result = 0 then
      return 0;
    elsif result >= 1 then
      return 1;
    else
      return null;
    end if;
  END; 
$BODY$ LANGUAGE plpgsql;

-- 1 down

drop function if exists answered(integer);
drop function if exists votes(text,integer);
drop function if exists flagged(text,integer);
drop table if exists answers;
drop table if exists votes;
drop table if exists flags;
drop table if exists comments;
drop table if exists questions;
drop table if exists mojo_migrations;


-- 2 up

CREATE OR REPLACE FUNCTION deletechildren() RETURNS trigger AS $$
  BEGIN
    IF TG_ARGV[0] = 'questions' THEN
      DELETE FROM comments WHERE question_id=OLD.question_id;
      DELETE FROM flags WHERE entry_type='questions' and entry_id = OLD.question_id;
      DELETE FROM votes where entry_type='questions' and entry_id = OLD.question_id;
    ELSE
      DELETE FROM flags WHERE entry_type='comments' and entry_id = OLD.comment_id;
      DELETE FROM votes where entry_type='comments' and entry_id = OLD.comment_id;
    END IF;
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;
  
CREATE TRIGGER deletecommentchildren
AFTER DELETE ON comments
FOR EACH ROW EXECUTE PROCEDURE deletechildren('comments');

CREATE TRIGGER deletequestionchildren
AFTER DELETE ON questions
FOR EACH ROW EXECUTE PROCEDURE deletechildren('questions');

CREATE OR REPLACE FUNCTION commentcount(integer) 
RETURNS integer AS
$BODY$
  declare result integer;
  BEGIN
    select
      COUNT(*) into result as counted
    from
      comments 
    where
      question_id=$1;
    if result is null or result = 0 then
      return 0;
    else
      return result;
    end if;
  END; 
$BODY$ LANGUAGE plpgsql;

-- 2 down 

DROP FUNCTION deletechildren() CASCADE;
DROP FUNCTION commentcount();

-- 3 up

create table if not exists users (
  id         text primary key,
  email      text,
  first_name text,
  last_name  text,
  admin      integer,
  created    timestamptz not null default now()
);
create table if not exists providers (
  id          text,
  provider_id text,
  provider    text,
  created     timestamptz not null default now(),
  PRIMARY KEY (id, provider_id, provider)
);

-- 3 down


drop table users;

drop table providers;

-- 4 up
ALTER TABLE comments ADD video_link text;
-- 4 down
alter table comments drop video_link;

-- 5 up

alter table users alter admin set default 0;

-- 5 down

alter table users alter admin drop default;

--6 up
create table if not exists feedbacks (
  feedback_id serial primary key,
  feedback_comment text not null,
  created timestamptz not null default now()
);

--6 down

drop table if exists feedbacks;
