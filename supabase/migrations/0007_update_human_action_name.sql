-- Phase v0.0.2/v0.0.5: Align World ID action name with underscore format
update gate.human
set action = 'verify_human'
where action = 'verify-human';
