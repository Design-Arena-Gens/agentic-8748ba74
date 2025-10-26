import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'EduBloom API',
    version: '1.0.0',
    description: 'REST API for the EduBloom educational analytics platform.'
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local development'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'GUARDIAN', 'STUDENT'] }
        }
      },
      Student: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          institutionId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Metric: {
        type: 'object',
        properties: {
          gpa: { type: 'number' },
          attendance: { type: 'integer' },
          assignmentsOnTime: { type: 'number' },
          quizAvg: { type: 'number' },
          lmsActivity: { type: 'number' }
        }
      },
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          message: { type: 'string' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          studentId: { type: 'string', format: 'uuid' },
          read: { type: 'boolean' }
        }
      },
      Note: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          studentId: { type: 'string', format: 'uuid' },
          authorId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Institution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          location: { type: 'string' },
          studentCount: { type: 'integer' }
        }
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        }
      },
      AuthLoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      AuthRegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'GUARDIAN', 'STUDENT'] }
        }
      },
      AuthRefreshRequest: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      RiskPredictionRequest: {
        type: 'object',
        required: ['attendance', 'gpa', 'assignments_on_time', 'quiz_avg', 'lms_activity'],
        properties: {
          attendance: { type: 'number' },
          gpa: { type: 'number' },
          assignments_on_time: { type: 'number' },
          quiz_avg: { type: 'number' },
          lms_activity: { type: 'number' }
        }
      },
      RiskPredictionResponse: {
        type: 'object',
        properties: {
          riskScore: { type: 'number' },
          factors: {
            type: 'object',
            additionalProperties: { type: 'number' }
          }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication and authorization' },
    { name: 'Users', description: 'User management' },
    { name: 'Students', description: 'Student operations and metrics' },
    { name: 'Alerts', description: 'Alert management' },
    { name: 'Notes', description: 'Notes management' },
    { name: 'Institutions', description: 'Institution management' },
    { name: 'AI', description: 'AI microservice proxy' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' }
            }
          }
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '400': { description: 'Invalid data' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user and issue JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
              example: { email: 'user@edu.com', password: 'password123!' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginResponse' },
                example: {
                  accessToken: 'token',
                  user: { id: '123', email: 'user@edu.com', role: 'FACULTY', name: 'Faculty Member' }
                }
              }
            }
          },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an expired access token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRefreshRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'New tokens issued',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginResponse' } } }
          },
          '401': { description: 'Refresh token invalid or expired' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Invalidate refresh token',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Logged out' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '404': { description: 'User not found' }
        }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Updated user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '404': { description: 'User not found' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'User deleted' }
        }
      }
    },
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List students',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Student list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } } }
        }
      }
    },
    '/students/import': {
      post: {
        tags: ['Students'],
        summary: 'Bulk import students from CSV',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Students imported' }
        }
      }
    },
    '/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Student details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          '404': { description: 'Student not found' }
        }
      }
    },
    '/students/{id}/metrics': {
      get: {
        tags: ['Students'],
        summary: 'Get student performance metrics',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Metrics data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Metric' } } } }
        }
      }
    },
    '/students/{id}/notes': {
      post: {
        tags: ['Students'],
        summary: 'Add note for student',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Note created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } }
        }
      },
      get: {
        tags: ['Students'],
        summary: 'Get notes for a student',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Student notes',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Note' } } } }
          }
        }
      }
    },
    '/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'Fetch alerts',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Alert list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Alert' } } } } }
        }
      },
      post: {
        tags: ['Alerts'],
        summary: 'Create alert',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'severity', 'studentId'],
                properties: {
                  message: { type: 'string' },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  studentId: { type: 'string', format: 'uuid' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Alert created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Alert' } } } }
        }
      }
    },
    '/alerts/{id}/read': {
      patch: {
        tags: ['Alerts'],
        summary: 'Mark alert as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Alert updated' }
        }
      }
    },
    '/notes': {
      post: {
        tags: ['Notes'],
        summary: 'Create note',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'content'],
                properties: {
                  studentId: { type: 'string', format: 'uuid' },
                  content: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Note created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } }
        }
      }
    },
    '/notes/student/{id}': {
      get: {
        tags: ['Notes'],
        summary: 'Get notes for a student',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Notes list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Note' } } } } }
        }
      }
    },
    '/institutions': {
      get: {
        tags: ['Institutions'],
        summary: 'List institutions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Institution list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Institution' } } } } }
        }
      },
      post: {
        tags: ['Institutions'],
        summary: 'Create institution',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  studentCount: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Institution created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Institution' } } } }
        }
      }
    },
    '/institutions/{id}': {
      patch: {
        tags: ['Institutions'],
        summary: 'Update institution',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  studentCount: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Institution updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Institution' } } } }
        }
      },
      delete: {
        tags: ['Institutions'],
        summary: 'Delete institution',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Institution deleted' }
        }
      }
    },
    '/ai/predict': {
      post: {
        tags: ['AI'],
        summary: 'Predict student risk score',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RiskPredictionRequest' }
            }
          }
        },
        responses: {
          '200': { description: 'Risk prediction', content: { 'application/json': { schema: { $ref: '#/components/schemas/RiskPredictionResponse' } } } }
        }
      }
    },
    '/ai/explain': {
      post: {
        tags: ['AI'],
        summary: 'Explain risk factors',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RiskPredictionRequest' }
            }
          }
        },
        responses: {
          '200': { description: 'Explanation generated' }
        }
      }
    },
    '/ai/retrain': {
      post: {
        tags: ['AI'],
        summary: 'Retrain AI model (mock)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          '202': { description: 'Retraining started' }
        }
      }
    }
  }
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
