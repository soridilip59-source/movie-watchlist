export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Family Movie Watchlist API',
    version: '1.0.0',
    description: 'RESTful API for family movie watchlists, age-appropriate rating recommendations, user authentication, reviews, and watch analytics.'
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local API Server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'User account signup & login' },
    { name: 'Family', description: 'Family profile & family members management' },
    { name: 'Movies', description: 'Movie catalog management & search' },
    { name: 'Watchlist', description: 'Family watchlist status, priority & tracking' },
    { name: 'Ratings & Reviews', description: 'Individual family member ratings & reviews' },
    { name: 'Recommendation Engine', description: 'Family Movie Night picker with automatic age rating protection' },
    { name: 'Analytics & Stats', description: 'Watch history statistics & family preferences' }
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Dilip Sori' },
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'securePassword123' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User account created successfully' },
          '400': { description: 'Email already registered or validation error' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'securePassword123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/family/{id}': {
      get: {
        tags: ['Family'],
        summary: 'Get family details and members',
        parameters: [
          { name: 'id', in: 'path', required: false, schema: { type: 'integer', default: 1 } }
        ],
        responses: {
          '200': { description: 'Family details retrieved successfully' },
          '404': { description: 'Family not found' }
        }
      }
    },
    '/family': {
      post: {
        tags: ['Family'],
        summary: 'Create a new family profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'The Smith Family' } }
              }
            }
          }
        },
        responses: { '201': { description: 'Family profile created' } }
      }
    },
    '/members': {
      post: {
        tags: ['Family'],
        summary: 'Add a new family member profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['family_id', 'name', 'role', 'age', 'max_rating'],
                properties: {
                  family_id: { type: 'integer', example: 1 },
                  name: { type: 'string', example: 'Leo' },
                  role: { type: 'string', enum: ['Parent', 'Teen', 'Kid', 'Other'], example: 'Kid' },
                  age: { type: 'integer', example: 8 },
                  max_rating: { type: 'string', enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], example: 'PG' },
                  avatar_emoji: { type: 'string', example: '🦸‍♂️' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Family member created' } }
      }
    },
    '/movies': {
      get: {
        tags: ['Movies'],
        summary: 'Search & filter movie catalog',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
          { name: 'content_rating', in: 'query', schema: { type: 'string', enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'] } },
          { name: 'streaming_service', in: 'query', schema: { type: 'string' } },
          { name: 'min_imdb', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
        ],
        responses: { '200': { description: 'Movies catalog response' } }
      },
      post: {
        tags: ['Movies'],
        summary: 'Add a new movie to catalog',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'release_year', 'genres', 'content_rating', 'duration_minutes', 'synopsis', 'director', 'streaming_services'],
                properties: {
                  title: { type: 'string', example: 'Moana 2' },
                  release_year: { type: 'integer', example: 2024 },
                  genres: { type: 'string', example: 'Animation, Adventure, Family' },
                  content_rating: { type: 'string', enum: ['G', 'PG', 'PG-13', 'R'], example: 'PG' },
                  duration_minutes: { type: 'integer', example: 100 },
                  synopsis: { type: 'string', example: 'Moana receives an unexpected call from her wayfinding ancestors.' },
                  director: { type: 'string', example: 'David G. Derrick Jr.' },
                  poster_url: { type: 'string', example: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1' },
                  streaming_services: { type: 'string', example: 'Disney+' },
                  imdb_rating: { type: 'number', example: 7.2 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Movie added' } }
      }
    },
    '/movies/{id}': {
      get: {
        tags: ['Movies'],
        summary: 'Get detailed movie info with family ratings',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Movie details' }, '404': { description: 'Movie not found' } }
      }
    },
    '/watchlist': {
      get: {
        tags: ['Watchlist'],
        summary: 'Get family watchlist',
        parameters: [
          { name: 'family_id', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['want_to_watch', 'watching', 'watched'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['high', 'medium', 'low'] } },
          { name: 'member_id', in: 'query', schema: { type: 'integer' } },
          { name: 'genre', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Watchlist items' } }
      },
      post: {
        tags: ['Watchlist'],
        summary: 'Add movie to family watchlist',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['family_id', 'movie_id'],
                properties: {
                  family_id: { type: 'integer', example: 1 },
                  movie_id: { type: 'integer', example: 1 },
                  added_by_member_id: { type: 'integer', example: 2 },
                  status: { type: 'string', enum: ['want_to_watch', 'watching', 'watched'], default: 'want_to_watch' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'], default: 'medium' },
                  notes: { type: 'string', example: 'Recommended by Mom' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Added to watchlist' } }
      }
    },
    '/watchlist/{id}': {
      patch: {
        tags: ['Watchlist'],
        summary: 'Update watchlist status or priority',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['want_to_watch', 'watching', 'watched'] },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Watchlist item updated' } }
      },
      delete: {
        tags: ['Watchlist'],
        summary: 'Remove movie from watchlist',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Removed from watchlist' } }
      }
    },
    '/ratings': {
      post: {
        tags: ['Ratings & Reviews'],
        summary: 'Submit or update a family member rating & review',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['movie_id', 'member_id', 'rating'],
                properties: {
                  movie_id: { type: 'integer', example: 1 },
                  member_id: { type: 'integer', example: 4 },
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  review_text: { type: 'string', example: 'Super funny emotions!' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Rating submitted' } }
      }
    },
    '/recommend': {
      post: {
        tags: ['Recommendation Engine'],
        summary: 'Generate safe Family Movie Night recommendations based on attending members',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['attending_member_ids'],
                properties: {
                  family_id: { type: 'integer', default: 1 },
                  attending_member_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2, 4] },
                  genre: { type: 'string', example: 'Animation' },
                  max_duration: { type: 'integer', example: 120 },
                  streaming_service: { type: 'string', example: 'Disney+' },
                  only_unwatched: { type: 'boolean', default: true }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Recommendation & Movie Night Winner generated' } }
      }
    },
    '/stats': {
      get: {
        tags: ['Analytics & Stats'],
        summary: 'Get family watch time, top genres, and ratings analytics',
        parameters: [{ name: 'family_id', in: 'query', schema: { type: 'integer', default: 1 } }],
        responses: { '200': { description: 'Family analytics statistics' } }
      }
    }
  }
};
