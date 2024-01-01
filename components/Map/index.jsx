import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Icon, Style } from "ol/style";
import { Locations } from "../../Data/Geolocation";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ReactEcharts from "echarts-for-react";
import collect from "@turf/collect";
import * as turf from "@turf/circle";
const Map = () => {
  const mapContainerRef = useRef(null);
  //modal is open?
  const [modalIsOpen, setModal] = useState(false);
  //define locations that i click it
  const [current, setcurrent] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [time, settime] = useState();
  const [temp, settemp] = useState();
  var data = {};
  useEffect(() => {
    const map = new OlMap({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [1, 1],
        zoom: 4,
      }),
    });

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
    });
    map.addLayer(markerLayer);

    //define handleClick function for handling
    const handleClick = (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const clickedLocation = feature.getProperties();
        setcurrent(clickedLocation);
        setModal(!modalIsOpen);
        handleShow();
        data = clickedLocation;

        if (data !== null) {
          settime(
            data.properties.data.map((item) => {
              return item.temp;
            })
          );
          settemp(
            data.properties.data.map((item) => {
              return item.time;
            })
          );
        }
      });
    };
    map.on("click", handleClick);
    Locations.forEach((location) => {
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([location.lon, location.lat])),
        properties: location, // Store the location data in the feature's properties
      });
      markerSource.addFeature(markerFeature);
      const markerStyle = new Style({
        image: new Icon({
          src: "/1564524_adress_gps_location_pin_position_icon.png", // Assuming each location object has its own icon property
          scale: 0.5,
        }),
      });
      markerFeature.setStyle(markerStyle);
    });

    return () => {
      map.setTarget(null);
      map.un("click", handleClick);
    };
  }, []);
  const option = {
    xAxis: {
      type: "category",
      data: temp,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: time,
        type: "line",
      },
    ],
  };

  return (
    <>
      {/* showing map  */}
      <div ref={mapContainerRef} style={{ height: "400px" }} />
      {/* Modal  */}
      <div>
        <>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className="bg-primary">
              <Modal.Title>Time Series</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div ref={mapContainerRef} style={{ height: "400px" }} />
              <ReactEcharts option={option} />
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        </>
      </div>
    </>
  );
};

export default Map;
