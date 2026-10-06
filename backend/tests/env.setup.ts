process.env['NODE_ENV'] = 'test';
process.env['ENABLE_EMAIL_VERIFICATION'] = 'false';
process.env['AUTH_RATE_LIMIT_MAX_REQUESTS'] = '100';
if (process.env['TEST_DATABASE_URL']) {
	process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'];
} else {
	process.env['DATABASE_URL'] ||= 'postgresql://test:test@localhost:5432/test';
}
process.env['JWT_ACCESS_SECRET'] ||= 'test-access-secret-with-at-least-32-characters';
process.env['JWT_REFRESH_SECRET'] ||= 'test-refresh-secret-with-at-least-32-characters';
process.env['SESSION_SECRET'] ||= 'test-session-secret-with-at-least-32-characters';
