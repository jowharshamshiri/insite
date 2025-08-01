# Browser MCP Architecture

## Core Components

### 1. Browser Manager (`src/browser-manager.ts`)
- Singleton class managing Playwright browser instance
- Handles browser lifecycle (launch, close, cleanup)
- Manages page contexts and tabs
- Configures browser options (headless mode, viewport, etc.)

### 2. MCP Server (`src/server.ts`)
- Main MCP server implementation
- Tool registration and routing
- Error handling and validation
- Connection management

### 3. Tool Definitions (`src/tools/`)

#### Navigation Tools
- **load_page**: Navigate to URL with optional wait conditions
- **go_back/forward**: Browser history navigation
- **reload**: Page refresh

#### Visual Tools  
- **screenshot**: Capture full page or element screenshots
- **get_viewport_info**: Current viewport dimensions

#### DOM Tools
- **get_dom**: Extract DOM tree or specific elements
- **get_element_info**: Element properties, attributes, text
- **get_page_title**: Current page title
- **get_current_url**: Current page URL

#### Console & Network Tools
- **get_console_logs**: Retrieve console messages/errors
- **clear_console**: Clear console history
- **get_network_logs**: Network request/response data

#### Interaction Tools
- **click_element**: Click on elements by selector
- **type_text**: Input text into form fields
- **press_key**: Keyboard input simulation
- **hover_element**: Mouse hover actions
- **scroll_to**: Scroll to elements or positions

#### JavaScript Tools
- **evaluate_js**: Execute JavaScript in page context
- **evaluate_js_on_element**: Execute JS on specific elements

#### Wait Tools
- **wait_for_element**: Wait for element to appear/disappear
- **wait_for_navigation**: Wait for page navigation
- **wait_for_load_state**: Wait for network/DOM ready states

#### Configuration Tools
- **set_viewport_size**: Adjust browser viewport
- **set_user_agent**: Change browser user agent
- **close_browser**: Clean browser shutdown

## Data Flow
1. MCP client sends tool request
2. Server validates parameters
3. Browser Manager executes Playwright operations
4. Results serialized and returned to client
5. Screenshots saved to temp directory with file paths returned

## Error Handling
- Playwright timeout errors
- Element not found errors
- JavaScript execution errors
- Network/connectivity issues
- File system errors for screenshots