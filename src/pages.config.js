import TestFunctions from './pages/TestFunctions';
import DashboardComponents from './pages/DashboardComponents';
import AIHub from './pages/AIHub';
import Home from './pages/Home';
import SearchPods from './pages/SearchPods';
import Settings from './pages/Settings';
import Template from './pages/Template';
import MindMap from './pages/MindMap';
import ResumeBuilder from './pages/ResumeBuilder';
import SearchResults from './pages/SearchResults';
import Markets from './pages/Markets';


export const PAGES = {
    "TestFunctions": TestFunctions,
    "DashboardComponents": DashboardComponents,
    "AIHub": AIHub,
    "Home": Home,
    "SearchPods": SearchPods,
    "Settings": Settings,
    "Template": Template,
    "MindMap": MindMap,
    "ResumeBuilder": ResumeBuilder,
    "SearchResults": SearchResults,
    "Markets": Markets,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};