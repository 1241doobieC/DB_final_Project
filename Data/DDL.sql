create table Person(
    id bigint(20)  NOT NULL AUTO_INCREMENT,
    user_name varchar(20) NOT NULL,
    phone varchar(10) NOT NULL,
    email varchar(64) UNIQUE NOT NULL,
    addr varchar(64) NOT NULL,
    password varchar(30),
    pos int DEFAULT 1,
    date timestamp on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    primary key (id)
);

create table Member(
    id bigint(20) NOT NULL,
    _rank float DEFAULT 2.5
);

create table Driver(
    id bigint(20)  NOT NULL,
    car varchar(10) NOT NULL,
    licence varchar(10) NOT NULL,
    area varchar(10) NOT NULL
);

create table Orders(
    order_id bigint(20) NOT NULL AUTO_INCREMENT,
    time timestamp on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    primary key (order_id)
);

create table Trans(
    trans_id bigint(20) NOT NULL AUTO_INCREMENT,
	cur_state int NOT NULL DEFAULT 0,
	addr varchar(64) NOT NULL,
	time timestamp on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	primary key (trans_id)
);

create table Product(
	product_id bigint(20) NOT NULL AUTO_INCREMENT,
	p_name varchar(40) NOT NULL,
	cost int NOT NULL,
	primary key (product_id)
);

create table Work(
	id int(20),
	trans_id int(20)
);

create table States(
	order_id bigint(20),
	trans_id bigint(20)
);

create table Buy(
	id bigint(20),
	order_id bigint(20)
);

create table Sell(
	id bigint(20),
	order_id bigint(20)
);

create table Own(
	id bigint(20),
	product_id bigint(20)
);

create table Contain(
	order_id bigint(20),
	product_id bigint(20)
);