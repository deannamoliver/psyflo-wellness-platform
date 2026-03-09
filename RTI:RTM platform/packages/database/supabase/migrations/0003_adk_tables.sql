-- Custom SQL migration file --

-- ADK Tables (Managed by Google ADK)

create table public.user_states (
  app_name character varying not null,
  user_id character varying not null,
  state jsonb not null,
  update_time timestamp without time zone not null,
  constraint user_states_pkey primary key (app_name, user_id)
) TABLESPACE pg_default;


create table public.sessions (
  app_name character varying not null,
  user_id character varying not null,
  id character varying not null,
  state jsonb not null,
  create_time timestamp without time zone not null,
  update_time timestamp without time zone not null,
  constraint sessions_pkey primary key (app_name, user_id, id)
) TABLESPACE pg_default;


create table public.events (
  id character varying not null,
  app_name character varying not null,
  user_id character varying not null,
  session_id character varying not null,
  invocation_id character varying not null,
  author character varying not null,
  branch character varying null,
  timestamp timestamp without time zone not null,
  content jsonb null,
  actions bytea not null,
  long_running_tool_ids_json text null,
  grounding_metadata jsonb null,
  partial boolean null,
  turn_complete boolean null,
  error_code character varying null,
  error_message character varying null,
  interrupted boolean null,
  constraint events_pkey primary key (id, app_name, user_id, session_id),
  constraint events_app_name_user_id_session_id_fkey foreign KEY (app_name, user_id, session_id) references sessions (app_name, user_id, id) on delete CASCADE
) TABLESPACE pg_default;


create table public.app_states (
  app_name character varying not null,
  state jsonb not null,
  update_time timestamp without time zone not null,
  constraint app_states_pkey primary key (app_name)
) TABLESPACE pg_default;
