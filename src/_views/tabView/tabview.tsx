"use client"
import Tab from 'react-bootstrap/Tab';
import react from 'react'
import {Row, Col, Nav, Form} from 'react-bootstrap'

export default function TabsView({children, defaultKey, keys}:Readonly<{children:React.ReactNode, defaultKey?:string, keys?:Array<string|number>}>) {
    const childrenArray = react.Children.toArray(children)
    return <Tab.Container defaultActiveKey={defaultKey}>
        <Row className='mt-4'>
            <Col style={{position:"relative"}}>
                <Nav className="justify-content-center" variant="pills">
                    {keys?.map((key,index)=>{
                        return <Nav.Item key={index}>
                            <Nav.Link id={String(key)} className='px-4 py-2 fs-4' eventKey={key}>{key}</Nav.Link>
                        </Nav.Item>
                    })}
                </Nav>
            </Col>
        </Row>
        <Row className='mt-0'>
            <Col>
                <Tab.Content>
                {keys?.map((key,index)=>{
                        return <Tab.Pane eventKey={key} key={index}>
                            {childrenArray[index]}
                        </Tab.Pane>
                    })}
                </Tab.Content>
            </Col>
        </Row>
    </Tab.Container>
}