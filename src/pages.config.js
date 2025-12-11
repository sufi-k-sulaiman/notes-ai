import TestFunctions from './pages/TestFunctions';
import DashboardComponents from './pages/DashboardComponents';
import Home from './pages/Home';
import Template from './pages/Template';
import SearchResults from './pages/SearchResults';
import Notes from './pages/Notes';
import Comms from './pages/Comms';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import __Layout from './Layout.jsx';


export const PAGES = {
    "TestFunctions": TestFunctions,
    "DashboardComponents": DashboardComponents,
    "Home": Home,
    "Template": Template,
    "SearchResults": SearchResults,
    "Notes": Notes,
    "Comms": Comms,
    "Search": Search,
    "NotFound": NotFound,
}

export const pagesConfig = {
    mainPage: "TestFunctions",
    Pages: PAGES,
    Layout: __Layout,
};