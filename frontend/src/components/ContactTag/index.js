import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(() => ({
    tag: {
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.68rem",
        fontWeight: 700,
        marginRight: "6px",
        marginTop: "4px",
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid rgba(148, 163, 184, 0.18)",
    }
}));

const getSoftTagStyle = (color) => {
    if (!color || typeof color !== "string") {
        return { backgroundColor: "#EFF6FF", color: "#1E3A8A" };
    }

    if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
        const normalized = color.length === 4
            ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
            : color;
        return {
            backgroundColor: `${normalized}1A`,
            color: normalized,
        };
    }

    return { backgroundColor: "rgba(226,232,240,0.72)", color: "#334155" };
};

const ContactTag = ({ tag }) => {
    const classes = useStyles();
    const softStyle = getSoftTagStyle(tag.color);

    return (
        <div className={classes.tag} style={softStyle}>
           {tag.name.toUpperCase()}
        </div>
    )
}

export default ContactTag;
