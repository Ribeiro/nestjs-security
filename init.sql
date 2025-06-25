-- public.http_call_audit definição
-- Drop table
-- DROP TABLE public.http_call_audit;

CREATE TABLE public.http_call_audit (
	id serial4 NOT NULL,
	revision int4 NOT NULL,
	entity_id text NOT NULL,
	"action" text NOT NULL,
	"timestamp" timestamptz DEFAULT now() NOT NULL,
	user_id text NULL,
	username text NULL,
	diff jsonb NULL,
	"data" jsonb NULL,
	ip text NULL,
	CONSTRAINT "PK_697dc7687b60b77c3f0e50403fc" PRIMARY KEY (id)
);
CREATE INDEX "IDX_HTTP_CALL_AUDIT_ENTITY_ID" ON public.http_call_audit USING btree (entity_id);
CREATE INDEX "IDX_HTTP_CALL_AUDIT_TIMESTAMP" ON public.http_call_audit USING btree ("timestamp");


-- public.anti_fraud_audit definição
-- Drop table
-- DROP TABLE public.anti_fraud_audit;

CREATE TABLE public.anti_fraud_audit (
	id serial4 NOT NULL,
	revision int4 NOT NULL,
	entity_id text NOT NULL,
	"action" text NOT NULL,
	"timestamp" timestamptz DEFAULT now() NOT NULL,
	user_id text NULL,
	username text NULL,
	diff jsonb NULL,
	"data" jsonb NULL,
	ip text NULL,
	CONSTRAINT "PK_c7131db273685bc652b88e236f4" PRIMARY KEY (id)
);
CREATE INDEX "IDX_ANTI_FRAUD_AUDIT_ENTITY_ID" ON public.anti_fraud_audit USING btree (entity_id);
CREATE INDEX "IDX_ANTI_FRAUD_AUDIT_TIMESTAMP" ON public.anti_fraud_audit USING btree ("timestamp");