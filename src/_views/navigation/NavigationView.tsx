import localizationData from '../../../_utilities/localization/en.json'
import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'next/image';
import NavbarBrand  from 'react-bootstrap/NavbarBrand';
import logo from '../../../public/images/logo.png'
import NavCanvasView from './_NavViews/NavCanvasView';

const navbarTopLinks = [
    localizationData.navbar_toplink1,
    localizationData.navbar_toplink2,
    localizationData.navbar_toplink3,
];

const sidebarLinks = [
    {
        link: localizationData.sidebar_link1,
        dropdown: true,
        dropdownContent: [
          { link:localizationData.sidebar_link1_drop1, category:"featured" }, 
          { link:localizationData.sidebar_link1_drop2, category:"tea" }, 
          { link:localizationData.sidebar_link1_drop3, category:"sport" },
          { link:localizationData.sidebar_link1_drop4, category:"entertainment" },
          { link:localizationData.sidebar_link1_drop5, category:"technology"  },
        ],
        id: "newsMenu",
    },
    {
        link: { link:localizationData.sidebar_link2, category:"interview" },
        dropdown: false,
    },
    {
        link: { link: localizationData.sidebar_link3, category:"music" },
        dropdown: false,
    },
    {
        link: { link: localizationData.sidebar_link4, category:"podcast" },
        dropdown: false,
    },
]

export default function NavigationView() {
    return(
        <header className="navbar-light navbar-sticky header-static">
            <div className="navbar-top d-block small">
                <Container>
                    <div className="d-flex justify-content-between align-items-center my-2">
                      <ul className="nav">
                        {
                          navbarTopLinks.map((link:string, index:number) => {
                            return <li className="nav-item" key={index}>
                              <Link className="nav-link" href={`/information/${link.replace("/","_")}`}>{link}</Link>
                            </li>
                          })
                        }
                      </ul>
                    </div>
                    <div className="border-bottom border-2 border-primary opacity-1"></div>
                </Container>
            </div>
            <Navbar>
                <Container style={{height:"80px"}}>
                    <NavbarBrand href='/'>
                        <Image 
                            className="navbar-brand-item" 
                            src={logo} 
                            alt="A Chief that has 100's in hand counting with ring on and smoking a cigar (not bad ppl do way worse I know yal see that up there when ranking so please dont hold it against me, feeding family) which is our Logo" 
                            style={{width:"75px", height:"50px"}} 
                            priority
                            placeholder='blur'
                        />
                    </NavbarBrand>
                    <NavCanvasView sidelinks={sidebarLinks}/>
                </Container>
            </Navbar>
        </header>
    )
}