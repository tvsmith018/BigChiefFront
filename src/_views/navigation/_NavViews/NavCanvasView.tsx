"use client"
import { useState } from "react"
import Image from "next/image";
import Link from "next/link";
import Nav from "react-bootstrap/Nav"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Spinner from "react-bootstrap/Spinner"
import Offcanvas from "react-bootstrap/Offcanvas"
import Dropdown from "react-bootstrap/Dropdown";
import localizationData from '../../../../_utilities/localization/en.json';
import Logo from '../../../../public/images/logo.png';
import Form from 'react-bootstrap/Form';
import { searchResults } from "./searchaction/searchResults";
import { ArticleType } from "../../../../_utilities/datatype/types";

export interface sidelink {
    link?: string,
    dropdown?: boolean,
    linksingle?: {link:string, category:string,},
    dropdownContent?:{link:string, category:string,}[],
    id?:string,
}

export default function NavCanvasView(props:{sidelinks:sidelink[]}){
    const [showSide, setShowSide] = useState(false);
    const [showSearch, setShowSearch] = useState(false)
    const [timer, setTimer] = useState<NodeJS.Timeout>();
    const [searchValue, setSearchValue] = useState("");
    const [searchLoad, setSearchLoad] = useState(false)
    const [searchData, setSearchData] = useState([])
    

    const handleSearch = (e:React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timer);
        const newTimer:NodeJS.Timeout = setTimeout(async () => {
            setSearchLoad(true)
            setSearchValue(e.target.value)
            setTimer(newTimer);
            const data = await searchResults(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", e.target.value)
            setSearchData(data)
            setSearchLoad(false)
        }, 1500)
    }
    const handleCloseSide = () => setShowSide(false);
    const handleShowSide = () => setShowSide(true);
    const handleCloseSearch = () => setShowSearch(false);
    const handleShowSearch = () => setShowSearch(true);

    return <>
        <Nav className="d-flex align-items-center w-75">
            <Nav.Item className="ms-auto"  onClick={handleShowSearch}>
                <Nav.Link className="py-0 ps-0 pe-0">
                    <i className="bi bi-search fs-4"></i>
                </Nav.Link>
            </Nav.Item>
            <Nav.Item onClick={handleShowSide}>
                <Nav.Link className="py-0 ps-2">
                    <i className="bi bi-text-right rtl-flip fs-4"></i>
                </Nav.Link>
            </Nav.Item>
        </Nav>
        <Offcanvas show={showSearch} onHide={handleCloseSearch} placement={"end"}>
              <Offcanvas.Header closeButton></Offcanvas.Header>
              <Offcanvas.Body>
                <Form>
                    <Form.Group controlId="formGroupSearch">
                        <Form.Control type="search" placeholder={"placeholder"} className="shadow-none rounded-pill" onChange={handleSearch}/>
                    </Form.Group>
                </Form>
                {
                    searchLoad && <div className="d-flex container h-75">
                        <Spinner animation="border" role="status" className="justify-content-center align-self-center mx-auto mb-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                }
                {
                    searchValue.length == 0 && !searchLoad && <div className="mt-3">
                        <p>
                            When looking for articles on our website you have the option to search by the following: 
                        </p>
                        <ul>
                            <li>title</li>
                            <li>author</li>
                            <li>category</li>
                        </ul>
                        <p>
                            Simply type in the information you have into the search bar and the system will immediately look 
                            through the database to find the article you are searching for. 
                        </p>
                    </div>
                }
                {
                    searchValue != "" && !searchLoad && searchData.length == 0 && <p className="mt-3">No Articles found </p>
                }
                {
                    searchValue != "" && !searchLoad && searchData.length > 0 && searchData.map((node:ArticleType, index:number)=>{
                        const article = node.node;
                        return <Row className="g-3 mt-1" key={index}>
                            <Col xs={3}>
                                <Image 
                                    src={article.image1x1Url ?? ""} 
                                    alt={article.altImage ?? ""} 
                                    className="img-fluid rounded-3" 
                                    loading="eager" 
                                    width={100} 
                                    height={100}
                                    sizes='100vw'
                                    placeholder='blur'
                                    blurDataURL='/images/1x1placeholder.png'
                                    onError={() => {
                                        return <Image src="/images/1x1placeholder.png" alt="image did not load" width={100} height={100} sizes='100vw' />
                                    }}
                                />
                            </Col>
                            <Col xs={9}>
                                <p>
                                    <a href={`/articles/details/${article.id}`} className="text-reset fw-bold">
                                        {article.title}
                                    </a>
                                </p>
                            </Col>
                        </Row>
                    })
                }
              </Offcanvas.Body>
       </Offcanvas>
       <Offcanvas show={showSide} onHide={handleCloseSide} placement={"start"}>
              <Offcanvas.Header closeButton></Offcanvas.Header>
              <Offcanvas.Body>
                <Image 
                    src={Logo} 
                    alt="Big Chief Ent Logo Again" 
                    className="mt-2 mb-3" 
                    height={200}
                    priority
                    placeholder='blur'
                />
                <p>{localizationData.sidebar_header_1} <strong>{localizationData.sidebar_header_2}</strong> {localizationData.sidebar_header_3} <strong>{localizationData.sidebar_header_4}</strong> {localizationData.sidebar_header_5}</p>
                <Nav as="ul" className="d-block flex-column mt-3 mb-0">
                    {
                        props.sidelinks.map((value:sidelink, index:number)=>{
                            if (value.dropdown == true){
                                return(
                                    <Dropdown as={Nav.Item} key={index} className="mb-2">
                                        <Dropdown.Toggle as={Nav.Link} id={value.id!}><span className="h5">{value.link}</span></Dropdown.Toggle>
                                        <Dropdown.Menu as="ul" className="position-absolute">
                                            {value.dropdownContent!.map((value1:{category:string,link:string}, index2:number)=>{
                                                return(
                                                    <li key={index2}>
                                                        <Dropdown.Item as="a" href={`/articles/${value1.category}`}>{value1.link}</Dropdown.Item>
                                                    </li>
                                                )
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>  
                                )
                            }
                            else {
                                return(
                                    <Nav.Item as="li" key={index} className="mb-2">
                                        <Nav.Link as="a" href={`/articles/${value.linksingle?.category}`}><span className="h5">{value.linksingle?.link}</span></Nav.Link>
                                    </Nav.Item>
                                )
                            }
    
                        })
                    }
                </Nav>
                <div className="bg-warning bg-opacity-10 p-4 mt-4 text-center w-100 rounded">
                    <span>{localizationData.sidebar_alert_title}</span>
                    <h3>{localizationData.sidebar_alert_header}</h3>
                    <p>{localizationData.sidebar_alert_para}</p>
                    <Link href="#" className="btn btn-warning disabled">{localizationData.sidebar_alert_button}</Link>
                </div>

              </Offcanvas.Body>
       </Offcanvas>
    </>
}