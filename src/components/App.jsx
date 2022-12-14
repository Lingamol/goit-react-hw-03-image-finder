import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Button from './Button';
import ImageGallery from './ImageGallery';
import Loader from './Loader';
import Modal from './Modal';
import SearchBar from './Searchbar';
import { Component } from 'react';
import { AppWrapper } from './App.styled';
// import { hits } from '../js/data';
import { fetchImagesWithQuery, PER_PAGE } from 'services/api';
import GalleryPagination from 'components/GalleryPagination';
// import GallaryContentLoader from 'GallaryContentLoader';

export class App extends Component {
  state = {
    // showModal: false,
    isLoading: false,
    error: null,
    galleryColection: [],
    activeGalleryItem: null,
    search: '',
    page: 1,
    totalHits: 0,
    pagination: 'LoadMore',
  };
  componentDidMount() {
    // console.log('App Mount');
  }

  componentWillUnmount() {
    // console.log('App WillUnmount');
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('App componentDidUpdate');
    const { page, search, pagination } = this.state;
    if (
      prevState.search !== search ||
      prevState.page !== page ||
      prevState.pagination !== pagination
    ) {
      this.FetchImg();
    }
    // if (prevState.pagination !== pagination && search !== '') {
    //   this.setState({ galleryColection: [], page: 1 });
    //   this.FetchImg();
    // }
  }

  FetchImg = async () => {
    const { page, pagination } = this.state;
    if (this.state.search === '') {
      return;
    }
    this.setState({ isLoading: true });
    try {
      const data = await fetchImagesWithQuery(
        this.state.search,
        this.state.page
      );
      const { hits, totalHits } = data;
      if (hits.length === 0) {
        toast.warn(
          '🦄 Sorry, there are no images matching your search query. Please try again.',
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
        return;
      } else if (page === 1 || pagination === 'Pagination') {
        this.setState({
          galleryColection: [...hits],
          totalHits,
        });
      } else if (pagination === 'LoadMore') {
        this.setState(state => ({
          galleryColection: [...state.galleryColection, ...hits],
          totalHits,
        }));
      }
    } catch (error) {
      this.setState({
        error,
      });
      toast.error('Sorry, something going wrong :(', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  toggleModal = () => {
    // this.setState(({ showModal }) => ({
    //   showModal: !showModal,
    // }));
    this.setState(({ activeGalleryItem }) => ({
      activeGalleryItem: null,
    }));
  };
  radioBtnChange = value => {
    // this.setState(({ showModal }) => ({
    //   showModal: !showModal,
    // }));
    console.log(value);
    this.setState({ pagination: value, page: 1, galleryColection: [] });
  };

  onSelectGalleryItem = item => {
    this.setState({ activeGalleryItem: item });
  };

  heandleSubmitForm = ({ search }) => {
    // console.log(pagination);
    // if (pagination !== 'LoadMore') {
    //   this.setState({ pagination: true });
    // } else if (this.state.pagination) {
    //   this.setState({ pagination: false });
    // }
    const normalizedSearch = search.toLocaleLowerCase();
    if (normalizedSearch && normalizedSearch !== this.state.search) {
      this.setState({
        search: normalizedSearch,
        page: 1,
        galleryColection: [],
      });
    }
  };
  OnClickLoadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };
  OnPagination = page => {
    // console.log(page);
    this.setState({ page });
  };

  onDisableLoadMore = () => {
    const { totalHits, page } = this.state;
    if (!totalHits) {
      return true;
    } else if (totalHits - PER_PAGE * page < 0) {
      return true;
    } else {
      return false;
    }
  };

  showBtnLoadMore = () => {
    const { totalHits } = this.state;
    if (totalHits / PER_PAGE > 1) {
      return true;
    } else {
      return false;
    }
  };
  showGallery = () => {
    const { totalHits } = this.state;
    if (totalHits) {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const { activeGalleryItem, isLoading, totalHits, pagination } = this.state;
    // console.log(this.state.gellaryColection);
    const showBtnLoadMore = this.showBtnLoadMore();
    const showGallery = this.showGallery();
    const countPages = Math.ceil(totalHits / PER_PAGE);
    return (
      <AppWrapper>
        <SearchBar
          onSubmit={this.heandleSubmitForm}
          paginationMode={pagination}
          isSubmitting={isLoading}
          radioBtnChange={this.radioBtnChange}
        />
        {/* {isLoading && galleryColection.length === 0 && <GallaryContentLoader />} */}
        {isLoading && <Loader />}
        {showGallery && (
          <ImageGallery
            galleryColection={this.state.galleryColection}
            onSelectGalleryItem={item => {
              this.onSelectGalleryItem(item);
            }}
          />
        )}

        {activeGalleryItem && (
          <Modal
            onClose={this.toggleModal}
            activeGalleryItem={this.state.activeGalleryItem}
          />
        )}

        {showBtnLoadMore && pagination === 'LoadMore' && (
          <Button
            onLoadMore={this.OnClickLoadMore}
            onDisableLoadMore={this.onDisableLoadMore}
          />
        )}
        {pagination === 'Pagination' && totalHits / PER_PAGE > 1 && (
          <GalleryPagination
            onPagination={this.OnPagination}
            countPages={countPages}
            currentPage={this.state.page}
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AppWrapper>
    );
  }
}
