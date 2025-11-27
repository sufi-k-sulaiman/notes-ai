import TestFunctions from './pages/TestFunctions';
import DashboardComponents from './pages/DashboardComponents';
import Home from './pages/Home';
import SearchPods from './pages/SearchPods';
import Settings from './pages/Settings';
import Template from './pages/Template';
import MindMap from './pages/MindMap';
import ResumeBuilder from './pages/ResumeBuilder';
import SearchResults from './pages/SearchResults';
import Markets from './pages/Markets';
import Learning from './pages/Learning';
import Intelligence from './pages/Intelligence';
import Notes from './pages/Notes';
import Comms from './pages/Comms';
import Games from './pages/Games';
import Geospatial from './pages/Geospatial';
import ContactUs from './pages/ContactUs';
import Governance from './pages/Governance';
import CookiePolicy from './pages/CookiePolicy';
import TermsOfUse from './pages/TermsOfUse';
import Teams from './pages/Teams';
import __Layout from './Layout.jsx';


export const PAGES = {
    "TestFunctions": TestFunctions,
    "DashboardComponents": DashboardComponents,
    "Home": Home,
    "SearchPods": SearchPods,
    "Settings": Settings,
    "Template": Template,
    "MindMap": MindMap,
    "ResumeBuilder": ResumeBuilder,
    "SearchResults": SearchResults,
    "Markets": Markets,
    "Learning": Learning,
    "Intelligence": Intelligence,
    "Notes": Notes,
    "Comms": Comms,
    "Games": Games,
    "Geospatial": Geospatial,
    "ContactUs": ContactUs,
    "Governance": Governance,
    "CookiePolicy": CookiePolicy,
    "TermsOfUse": TermsOfUse,
    "Teams": Teams,
}

export const pagesConfig = {
    mainPage: "TestFunctions",
    Pages: PAGES,
    Layout: __Layout,
};