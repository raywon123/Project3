import React, { Component } from "react";
import ManagerPage from "../components/ManagerPage";
import API from "../utils/API";
import NavTabsManager from "../components/NavTabsManager";
import { Link } from "react-router-dom";
import { Col, Row, Container } from "../components/Grid";


var str = "Profile Page"

class ProfileManager extends Component {
  state = {
    books: [],
    title: "",
    author: "",
    synopsis: ""
  };

  componentDidMount() {
    this.loadBooks();
  }

  loadBooks = () => {
    API.getBooks()
      .then(res =>
        this.setState({ books: res.data, title: "", author: "", synopsis: "" })
      )
      .catch(err => console.log(err));
  };

  deleteBook = id => {
    API.deleteBook(id)
      .then(res => this.loadBooks())
      .catch(err => console.log(err));
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    if (this.state.title && this.state.author) {
      API.saveBook({
        title: this.state.title,
        author: this.state.author,
        synopsis: this.state.synopsis
      })
        .then(res => this.loadBooks())
        .catch(err => console.log(err));
    }
  };

  render() {
    return (
      <Container fluid>
      <NavTabsManager />
        <Row>
          <ManagerPage>
            {str}
          </ManagerPage>
        </Row>
      </Container>
    );
  }
}

export default ProfileManager;