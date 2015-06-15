$ sudo sudo -u postgres psql
=# create database "dbname";
\dt table (show tables)
\d+ (describe table)
\du (show users)
grant all on database dbname to mojo;
alter table t alter column c type t
insert into t (c1, c2) values (v1, v2) returning id
select SUM(CASE WHEN vote = 'up' THEN 1 ELSE -1 END) AS votes from votes where entry_type='questions' and entry_id=1;
select question,comment from questions left join comments on questions.id=comments.question_id where questions.id=1 and answer is not null;
