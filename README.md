# REST Client - A Postman-like API Testing Tool

A powerful REST API client built with Next.js, TypeScript, and MikroORM that provides a Postman-like experience for testing HTTP APIs.

## Features

### 🚀 HTTP Request Testing

- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- Custom headers management
- Request body support for POST/PUT/PATCH requests
- Environment variable substitution using `{{variableName}}` syntax
- Real-time response viewing with syntax highlighting

### 📊 Response Handling

- Detailed response information (status, headers, body, response time)
- Color-coded status indicators
- JSON formatting and syntax highlighting
- Error handling and display

### 📚 Request History

- Automatic saving of all requests to SQLite database using MikroORM
- Pagination support for large datasets
- Search and filter functionality
- Request history with response details
- Load previous requests for quick re-execution

### 🗂️ Collections Management

- Organize requests into collections
- Save and manage multiple requests
- Export/import collections
- Persistent storage in browser localStorage

### 🌍 Environment Management

- Create multiple environments (Dev, Staging, Production, etc.)
- Define environment variables
- Variable substitution in URLs, headers, and request bodies
- Switch between environments easily

### 💾 Data Management

- Export all data (collections, environments, history) to JSON
- Import data from JSON files or clipboard
- Backup and restore functionality
- Data persistence across sessions

### ⚡ Performance Features

- Efficient pagination for large datasets
- Lazy loading of request history
- Caching strategies for better performance
- Background request processing

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with MikroORM
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd warewe
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Making HTTP Requests

1. **Select HTTP Method**: Choose from GET, POST, PUT, DELETE, etc.
2. **Enter URL**: Input the API endpoint URL
3. **Add Headers**: Configure request headers as needed
4. **Set Request Body**: For POST/PUT/PATCH requests, add JSON or text body
5. **Send Request**: Click "Send Request" to execute

### Using Environment Variables

1. **Create Environment**: Go to the Environments section and create a new environment
2. **Add Variables**: Define variables like `baseUrl`, `apiKey`, etc.
3. **Use Variables**: Reference them in requests using `{{variableName}}` syntax

Example:

- Environment variable: `baseUrl` = `https://api.example.com`
- Request URL: `{{baseUrl}}/users`
- Resolved URL: `https://api.example.com/users`

### Managing Collections

1. **Create Collection**: Click "New Collection" and give it a name
2. **Save Requests**: Use "Save Current" to add the current request to a collection
3. **Load Requests**: Click "Load" to load a saved request from a collection
4. **Export/Import**: Use the Data Management section to backup collections

### Viewing Request History

- All requests are automatically saved to the database
- Use the History tab to view previous requests
- Search by URL or request name
- Filter by HTTP method
- Pagination for performance with large datasets

## Database Schema

The application uses MikroORM with SQLite to store request history:

```typescript
@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  url!: string;

  @Enum(() => HttpMethod)
  method!: HttpMethod;

  @Property({ type: "text", nullable: true })
  headers?: string; // JSON string

  @Property({ type: "text", nullable: true })
  body?: string;

  @Property({ type: "text", nullable: true })
  response?: string; // JSON string

  @Property({ nullable: true })
  statusCode?: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ nullable: true })
  responseTime?: number; // in milliseconds

  @Property({ nullable: true })
  name?: string; // User-defined name for the request
}
```

## API Routes

### POST /api/request

Execute HTTP requests and save to history.

**Request Body:**

```json
{
  "url": "string",
  "method": "GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS",
  "headers": "object",
  "body": "string",
  "name": "string"
}
```

### GET /api/history

Retrieve paginated request history.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for URL or name
- `method`: Filter by HTTP method

### DELETE /api/history

Delete a specific request from history.

**Query Parameters:**

- `id`: Request ID to delete

## Performance Optimizations

1. **Pagination**: Large datasets are paginated to improve performance
2. **Lazy Loading**: Components load data only when needed
3. **Caching**: Response data is cached for better UX
4. **Background Processing**: Long-running requests don't block the UI
5. **Database Indexing**: Optimized database queries with proper indexing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Authentication and user management
- [ ] Team collaboration features
- [ ] API documentation generation
- [ ] Request chaining and workflows
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] Performance monitoring and analytics
- [ ] Dark theme support
- [ ] Keyboard shortcuts
- [ ] Request mocking capabilities

## Support

For support, please open an issue on GitHub or contact the development team.
