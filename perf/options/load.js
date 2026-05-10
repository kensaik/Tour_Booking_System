export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{kind:read}': ['p(95)<500'],
    'http_req_duration{kind:write}': ['p(95)<1500'],
  },
};
