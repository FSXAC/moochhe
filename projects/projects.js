// Container reference
var $container;

// Project template replaceable keys
const rp = {
    year: '{{year}}',
    blocks: '{{blocks}}',
    block: '{{block}}',
    color: '{{color}}',
    icon: '{{icon}}',
    title: '{{title}}',
    date: '{{date}}',
    img: '{{img}}',
    src: '{{src}}',
    desc: '{{desc}}',
    extra: '{{extra}}',
    href: '{{href}}',
    text: '{{text}}'
};

const templateColor = {
    green: 'success',
    yellow: 'warning',
    blue: 'primary',
    sky: 'info',
    red: 'danger'
};

const templateIcon = {
    chip: 'chip.svg',
    code: 'code.svg',
    cube: 'cube.svg',
    tools: 'tools.svg'
};

const scopeMappings = {
    'independent': 'Independent Project',
    'course': 'Course Project',
    'open': 'Open Source Project',
    'hack': 'Hackathon Project',
    'competition': 'Competition'
}

const contributorEnabledScopes = [
    'course',
    'hack',
    'competition'
]

/* Set global variable $container to reference the DOM element
 * @param container JQuery object of the DOM
 */
function setContainer(container) {
    if (container !== undefined) {
        $container = container;
    }
}

/* Loads a JSON object from file or path
 * @param path The path to the JSON file
 * @param callback The callback function for when JSON file is obtained
 */
function loadJSON(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == '200') {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

/* Reads projects.json and populates HTML
 */
function readProjects(callback) {
    loadJSON('projects.json', function(response) {
        if ($container !== undefined && $container !== null) {
            parseProjects(JSON.parse(response).projects);
            callback();
        }
    });

    return true;
}

/* Render a given list of projects to HTML and add to DOM
 * @param pjs The List of projects given
 */
function parseProjects(pjs) {
    // Get a list of years
    var yearsList = listProjectYears(pjs);
    var yearsMapData = yearsList;
    var yearsMap;

    // For each year, add their containers
    for (var i = 0, n = yearsMapData.length; i < n; i++) {
        var year = yearsMapData[i];
        var yearId = genId('year', year);

        yearsMapData[i] = [year, yearId];

        // Create HTML
        renderYearContainer(year, {
            id: yearId
        });

        // Also for each year, add the buttons at top to go to the year
        renderYearButton(year, yearId);
    }

    // For each project, add to their year containers
    for (var p = 0, l = pjs.length; p < l; p++) {
        renderProject(pjs[p], {
            // Options here
        });
    }
}

/* Creates DOM objects for a year that will contain the projects for that year
 * @param year The year container that needs to be created
 * @param options Contains the options for creating the container DOM element
 */
function renderYearContainer(year, options) {
    // Default options
    options          = options              || {};
    var id           = options.id           || 'unidentified';
    var reverseOrder = options.reverseOrder || false;
    var headLink     = options.headerLink   || '#root';

    // Render container HTML
    var outHtml = '<div id="' + id + '" class=timeline-year><a ';
    if (headLink !== undefined || headLink !== '' || headLink !== null) {
        outHtml += 'href=' + headLink;
    }
    outHtml += '><h2>' + year + '</h2></a></div><section id="';
    outHtml += id + '-c" class="timeline timeline-container"></section>';

    // Add to page
    if (reverseOrder) {
        $container.prepend(outHtml);
    } else {
        $container.append(outHtml);
    }
}

/* Creates the HTML for the button that goes to the year container
 * @param year The year being added
 * @param yearId The targe ID of the year container
 */
function renderYearButton(year, yearId) {
    var outHtml = '<a class="btn btn-secondary" href="#' + yearId + '">' + year + '</a>';
    $('#year-listings').append(outHtml);
}

/* Gets a set of all years of projects for each project in the project list
 * @param pjs The list of projects given
 * @return An array with all years as string
 */
function listProjectYears(pjs) {
    years = [];
    for (var i = 0, n = pjs.length; i < n; i++) {
        var year = getProjectYear(pjs[i]);
        if (years.includes(year)) {
            continue;
        } else {
            years.push(year);
        }
    }
    return years;
}

/* Renders the HTML for a single project
 * @param project The project object that is to be rendered
 * @param options The options for rendering the HTML of the project
 */
function renderProject(project, options) {
    // Default options values
    options = options || {};

    // Read information from project entry
    var icon, iconColor;
    switch (project.type) {
        case 'code':
            icon = templateIcon.code;
            iconColor = templateColor.sky;
            break;
        case 'mech':
            icon = templateIcon.tools;
            iconColor = templateColor.yellow;
            break;
        case 'elec':
            icon = templateIcon.chip;
            iconColor = templateColor.blue;
            break;
        case 'design':
            icon = templateIcon.cube;
            iconColor = templateColor.green;
            break;
        default:
            icon = '';
            iconColor = templateColor.red;
            console.error('Project type error', project);
            break;
    }

    var projectDate = project.dates.end;
    var projectYear = getProjectYear(project);
    var projectImg = project.thumbnail;

    // Write HTML
    var outHtml = '<div class="timeline-block">';
    outHtml += '<div class="timeline-icon timeline-icon-' + iconColor + '">';
    outHtml += '<img src="img/icons/' + icon + '" alt="' + icon + '"></div>';
    outHtml += '<div class="timeline-body">';
    outHtml += '<h2>' + project.name + '</h2>';
    outHtml += '<p class="timeline-date">' + projectDate + '</p>';
    
    // Add scope
    let infoHtml = '';
    const projectScope = project.scope;
    if (projectScope)
    {
        infoHtml += '[';
        infoHtml += scopeMappings[project.scope];
        infoHtml += ']';
    }

    // Add contributors
    const projectContributors = project.contributors;
    if (contributorEnabledScopes.indexOf(projectScope) >= 0) {
        if (projectContributors.length > 1) {
            infoHtml += '<em> Contributors: ';
            for (let i = 0; i < projectContributors.length; i++) {
                infoHtml += projectContributors[i];
                if (i != projectContributors.length - 1) {
                    infoHtml += ', ';
                }
            }
            infoHtml += '</em>'
        }
    }

    if (infoHtml.length != 0) {
        outHtml += '<p class="text-muted">'
        outHtml += infoHtml;
        outHtml += '</p>';
    }

    if (projectImg !== null && projectImg !== undefined && projectImg !== '') {
        outHtml += '<img src="' + projectImg + '" alt="' + projectImg + '">';
    }

    outHtml += '<p class="">';
    outHtml += project.description;
    outHtml += '</p>';

    // Tech used
    const projectTech = project.tech;
    if (projectTech.length != 0) {
        outHtml += '<p class="small">Tech used: '
        for (let i = 0; i < projectTech.length; i++) {

            // Make upper case and add to html
            outHtml += projectTech[i].replace(/^\w/, c => c.toUpperCase())
            if (i != projectTech.length - 1) {
                outHtml += ', ';
            }
        }
        outHtml += '</p>';
    }

    Object.keys(project.links).forEach(function(key, index) {
        outHtml += '<a class="btn btn-sm btn-outline-secondary" href="' + project.links[key] + '">';
        outHtml += capitalizeString(key) + '</a>';
    });

    outHtml += '</div></div>';

    // Add HTML to existing DOM
    var target = '#' + genId('year', projectYear) + '-c';
    $(target).append(outHtml);
}

/* Given a project, returns the year of the project in string form
 * @param project The project object
 * @param selectEnd If true, will return the year the project is finished
 * @return The year the project ended as a string
 */
function getProjectYear(project, selectEnd) {
    selectEnd = selectEnd || true;
    var date = selectEnd ? project.dates.end : project.dates.start;

    if (date !== undefined && date !== '' && date !== null) {
        var year = date.match(/([0-9])\d+/);
        if (year !== null) {
            return year[0];
        } else {
            console.error('Error while getting year: ', project);
            return null;
        }
    } else {
        console.error('No date: ', project);
        return null;
    }
}

/* Capitalizes the first character in a string
 * @param str The string to capitalize
 * @return The string with the first letter in upper case
 */
function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* Returns a generated ID
 * @param prefix The prefix of the ID
 * @param name Name of the ID
 * @return The ID as string
 */
function genId(prefix, name) {
    return prefix + name;
}