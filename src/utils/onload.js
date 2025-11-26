export function ExtractInfo() {
    // First, get and remove the server's HTML elements
    const preElement = document.getElementsByTagName('pre')[0];
    if (!preElement) {
        return null;
    }

    // Remove the horizontal rules as in the original
    document.querySelectorAll('body hr').forEach(hr => hr.remove());
    document.querySelectorAll('body h1').forEach(h1 => h1.remove());

    // Extract the current folder path from location pathname
    const pathname = location.pathname;
    const decodedPathname = decodeURIComponent(pathname);
    const currentPath = decodedPathname.replace(/^\/|\/$/g, '') || '/';
    const currentPathArray = decodedPathname
        .replace(/^\/|\/$/g, '')
        .split('/')
        .filter(Boolean);

    // Set the document title based on the path
    document.title = `Index of ${currentPathArray[currentPathArray.length - 2]}`;

    // Parse file/folder entries
    const entries = [];
    let currentEntry = null;
    let textNodes = [];

    // Process all child nodes in the pre element
    for (let i = 0; i < preElement.childNodes.length; i++) {
        const node = preElement.childNodes[i];

        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
            // This is a link element - start a new entry
            const href = node.getAttribute('href');
            const text = node.textContent || node.innerText;

            // Skip parent directory link
            if (text === '../') continue;

            currentEntry = {
                href: href,
                name: text, // Use the original text to preserve the slash for folders
                isDirectory: text.endsWith('/'),
                text: text
            };
        } else if (node.nodeType === Node.TEXT_NODE) {
            // This is text content with date/time/size info
            const text = node.nodeValue.trim();
            if (text) {
                textNodes.push(text);
            }
        }

        // If we have both an entry and text information, process them together
        if (currentEntry && textNodes.length > 0) {
            const textContent = textNodes.join(' ').trim();
            const parts = textContent.split(/\s+/).filter(Boolean);

            if (parts.length >= 3) {
                const date = parts[0];
                const time = parts[1];
                const size = parts[2];

                currentEntry.date = formatDate(date, time);
                currentEntry.size = formatSize(size);
                currentEntry.rawDate = `${date} ${time}`;
                currentEntry.rawSize = size;
            }

            entries.push(currentEntry);
            currentEntry = null;
            textNodes = [];
        }
    }

    // Remove the server's pre element from the DOM
    preElement.remove();

    return {
        currentPath: currentPath,
        currentPathArray: currentPathArray,
        entries: entries
    };
}

// Helper functions from the original HTML
function formatDate(date, time) {
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const [day, month, year] = date.split('-');
    return `${year}-${mon[month]}-${day} ${time}`;
}

function formatSize(size) {
    if (size === '-') return '';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let s = Number(size);
    for (const u of units) {
        if (s < 1024) return s.toFixed(2) + ' ' + u;
        s /= 1024;
    }
    return s.toFixed(2) + ' ' + units.at(-1);
} 